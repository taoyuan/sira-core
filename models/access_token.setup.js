"use strict";

var uid = require('uid2');

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
        uid(this.settings.accessTokenIdLength || DEFAULT_TOKEN_LEN, function(err, guid) {
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

};