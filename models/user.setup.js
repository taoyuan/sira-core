"use strict";

var sira = require('sira');
var validator = require('validator');
var bcrypt = require('bcryptjs');

var SALT_WORK_FACTOR = 10;
var DEFAULT_TTL = 1209600; // 2 weeks in seconds
var DEFAULT_RESET_PW_TTL = 15 * 60 ;// 15 mins in seconds
var DEFAULT_MAX_TTL = 31556926; // 1 year in second

module.exports = function (User, app) {
    var ACL = app.model('ACL');
    var Role = app.model('Role');

    User.settings.acls = [
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            permission: ACL.DENY
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            permission: ACL.ALLOW,
            property: 'create'
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.OWNER,
            permission: ACL.ALLOW,
            property: 'removeById'
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            permission: ACL.ALLOW,
            property: "login"
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            permission: ACL.ALLOW,
            property: "logout"
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.OWNER,
            permission: ACL.ALLOW,
            property: "findById"
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.OWNER,
            permission: ACL.ALLOW,
            property: "updateAttributes"
        },
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            permission: ACL.ALLOW,
            property: "confirm"
        }
    ];


    // max ttl
    User.settings.maxTTL = User.settings.maxTTL || DEFAULT_MAX_TTL;
    User.settings.ttl = DEFAULT_TTL;

    User.validatesUniquenessOf('email', {allowNull: true, allowBlank: true, message: 'Email already exists'});
    User.validate('email', emailValidator, {message: 'invalid email'});

    User.setter.password = function (plain) {
        var salt = bcrypt.genSaltSync(this.constructor.settings.saltWorkFactor || SALT_WORK_FACTOR);
        this.__data.password = bcrypt.hashSync(plain, salt);
    };

    User.hook('beforeUpdate', function (data) {
        data.updated = new Date();
    });


    /**
     * Create access token for the logged in user. This method can be overridden to
     * customize how access tokens are generated
     *
     * @param {Number} [ttl] The requested ttl
     * @param {Function} cb The callback function (err, token)
     */
    User.prototype.createAccessToken = function(ttl, cb) {
        var Clazz = this.constructor;
        ttl = Math.min(ttl || Clazz.settings.ttl, Clazz.settings.maxTTL);
        this.accessTokens.create({
            ttl: ttl
        }, cb);
    };


    /**
     * Login a user by with the given `credentials`.
     *
     * ```js
     *    User.login({username: 'foo', password: 'bar'}, function (err, token) {
 *      console.log(token.id);
 *    });
     * ```
     *
     * @param {Object} credentials
     * @param {Function} cb (err, token)
     */

    User.login = function (credentials, cb) {
        var self = this;

        var query = {};
        if(credentials.email) {
            query.email = credentials.email;
        } else if(credentials.username) {
            query.username = credentials.username;
        } else {
            var err = new Error('username or email is required');
            err.statusCode = 400;
            return cb(err);
        }

        self.findOne({where: query}, function(err, user) {
            var defaultError = new Error('login failed');
            defaultError.statusCode = 401;

            if(err) {
                debug('An error is reported from User.findOne: %j', err);
                cb(defaultError);
            } else if(user) {
                user.validatePassword(credentials.password, function(err, isMatch) {
                    if(err) {
                        debug('An error is reported from User.validatePassword: %j', err);
                        cb(defaultError);
                    } else if(isMatch) {
                        user.createAccessToken(credentials.ttl, function(err, token) {
                            if (err) return cb(err);
                            token.__data.user = user;
                            cb(err, token);
                        });
                    } else {
                        debug('The password is invalid for user %s', query.email || query.username);
                        cb(defaultError);
                    }
                });
            } else {
                debug('No matching record is found for user %s', query.email || query.username);
                cb(defaultError);
            }
        });
    };

    /**
     * Logout a user with the given accessToken id.
     *
     * ```js
     *    User.logout('asd0a9f8dsj9s0s3223mk', function (err) {
 *      console.log(err || 'Logged out');
 *    });
     * ```
     *
     * @param {String} tokenId
     * @param {Function} cb (err)
     */

    User.logout = function (tokenId, cb) {
        this.relations.accessTokens.modelTo.findById(tokenId, function (err, accessToken) {
            if (err) return cb(err);
            if(accessToken) return accessToken.destroy(cb);
            cb(new Error('could not find accessToken'));
        });
    };

    /**
     * Compare the given `password` with the users hashed password.
     *
     * @param {String} password The plain text password
     * @param {Function} cb (err, isMatch)
     */

    User.prototype.validatePassword = function (password, cb) {
        if (this.password && password) {
            bcrypt.compare(password, this.password, function(err, isMatch) {
                if (err) return cb(err);
                cb(null, isMatch);
            });
        } else {
            cb(null, false);
        }
    };


    /**
     * Create a short lived acess token for temporary login. Allows users
     * to change passwords if forgotten.
     *
     * @param {Object} options
     * @param {String} [options.email] The user's email address
     * @param {Function} cb (err, ingo)
     */

    User.resetPassword = function(options, cb) {
        var Clazz = this;
        var ttl = Clazz.settings.resetPasswordTokenTTL || DEFAULT_RESET_PW_TTL;

        options = options || {};
        if(typeof options.email === 'string') {
            Clazz.findOne({ where: {email: options.email} }, function(err, user) {
                if(err) {
                    cb(err);
                } else if (user) {
                    // create a short lived access token for temp login to change password
                    // TODO - eventually this should only allow password change
                    user.accessTokens.create({ttl: ttl}, function(err, accessToken) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null,  {
                                email: options.email,
                                accessToken: accessToken,
                                user: user
                            });
                        }
                    })
                } else {
                    cb();
                }
            });
        } else {
            var err = new Error('email is required');
            err.statusCode = 400;

            cb(err);
        }
    };

    sira.expose(User.login, {
        accepts: [
            {arg: 'credentials', type: 'object', required: true, source: 'payload'}
        ],
        returns: {
            arg: 'accessToken', type: 'object', root: true, description:
                'The result AccessToken created on login.\n\n'
        },
        http: {verb: 'post'}
    });

    sira.expose(User.logout, {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, source: function(ctx) {
                var req = ctx && ctx.request;
                var accessToken = req && (req.accessToken || req.token);
                return accessToken && accessToken.id;
            }, description:
                'Do not supply this argument, it is automatically extracted ' +
                'from request.'
            }
        ],
        http: {verb: 'all'}
    });

//    sira.expose(User.confirm, {
//        accepts: [
//            {arg: 'uid', type: 'string', required: true},
//            {arg: 'token', type: 'string', required: true}
//        ],
//        http: {verb: 'get', path: '/confirm'}
//    });

    sira.expose(User.resetPassword, {
        accepts: [
            {arg: 'options', type: 'object', required: true, source: 'payload'}
        ],
        http: {verb: 'post', path: '/reset'}
    });

};

function emailValidator(err) {
    if (this.email && this.email.length > 0 && !validator.isEmail(this.email)) err();
}