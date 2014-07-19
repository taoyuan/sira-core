"use strict";

var uid = require('uid2');
var assert = require('assert');

var DEFAULT_TOKEN_LEN = 64;

module.exports = function (AccessToken) {


    /**
     * Anonymous Token
     *
     * ```js
     * assert(AccessToken.ANONYMOUS.id === '$anonymous');
     * ```
     */

    AccessToken.ANONYMOUS = new AccessToken({id: '$anonymous'});

    /**
     * Create a cryptographically random access token id.
     *
     * @param {Function} cb callback (err, token)
     */

    AccessToken.createAccessTokenId = function (cb) {
        uid(this.settings.accessTokenIdLength || DEFAULT_TOKEN_LEN, function (err, guid) {
            err ? cb(err) : cb(err, guid);
        });
    };

    /*!
     * Hook to create accessToken id.
     */

    AccessToken.hook('beforeCreate', function (data, next) {
        data = data || {};

        if (data.id) return next();

        AccessToken.createAccessTokenId(function (err, id) {
            if (err) return next(err);
            data.id = id;
            next();
        });
    });


    /**
     * Find a token for the given `ServerRequest`.
     *
     * @param {object} req
     * @param {Object} [options] Options for finding the token
     * @param {Function} cb (err, token)
     */

    AccessToken.findForRequest = function (req, options, cb) {
        var id = tokenIdForRequest(req, options);

        if (id) {
            this.findById(id, function (err, token) {
                if (err) return cb(err);
                if (!token) return cb();
                token.validate(function (err, isValid) {
                    if (err) return cb(err);
                    if (isValid) return cb(null, token);
                    var e = new Error('Invalid Access Token');
                    e.status = e.statusCode = 401;
                    cb(e);
                });
            });
        } else {
            process.nextTick(function () {
                cb();
            });
        }
    };

    /**
     * Validate the token.
     *
     * @callback {Function} cb (err, isValid)
     */

    AccessToken.prototype.validate = function (cb) {
        try {
            assert(this.created && typeof this.created.getTime === 'function', 'token.created must be a valid Date');
            assert(this.ttl !== 0, 'token.ttl must be not be 0');
            assert(this.ttl, 'token.ttl must exist');
            assert(this.ttl >= -1, 'token.ttl must be >= -1');

            var now = Date.now();
            var created = this.created.getTime();
            var elapsedSeconds = (now - created) / 1000;
            var secondsToLive = this.ttl;
            var isValid = elapsedSeconds < secondsToLive;

            if (isValid) {
                cb(null, isValid);
            } else {
                this.destroy(function (err) {
                    cb(err, isValid);
                });
            }
        } catch (e) {
            cb(e);
        }
    };

    function tokenIdForRequest(req, options) {
        var params = options.params || [];
        var headers = options.headers || [];
        var cookies = options.cookies || [];
        var i = 0;
        var length;
        var id;

        params = params.concat(['access_token']);
        headers = headers.concat(['X-Access-Token', 'authorization']);
        cookies = cookies.concat(['access_token', 'authorization']);

        for (length = params.length; i < length; i++) {
            id = req.param(params[i]);

            if (typeof id === 'string') {
                return id;
            }
        }

        for (i = 0, length = headers.length; i < length; i++) {
            id = req.header(headers[i]);

            if (typeof id === 'string') {
                // Add support for oAuth 2.0 bearer token
                // http://tools.ietf.org/html/rfc6750
                if (id.indexOf('Bearer ') === 0) {
                    id = id.substring(7);
                    // Decode from base64
                    var buf = new Buffer(id, 'base64');
                    id = buf.toString('utf8');
                }
                return id;
            }
        }

        if (req.signedCookies) {
            for (i = 0, length = cookies.length; i < length; i++) {
                id = req.signedCookies[cookies[i]];

                if (typeof id === 'string') {
                    return id;
                }
            }
        }
        return null;
    }


}
;