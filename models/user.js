"use strict";

module.exports = {
    properties: {
        realm: {type: String},
        username: {type: String, index: true},
        email: {type: String, index: true},
        password: {type: String},
        emailVerified: Boolean,
        verificationToken: String,

        credentials: [
            'UserCredential' // User credentials, private or public, such as private/public keys, Kerberos tickets, oAuth tokens, facebook, google, github ids
        ],
        challenges: [
            'Challenge' // Security questions/answers
        ],
        status: String,
        created: {type: Date, default: function () { return new Date;}},
        updated: {type: Date, default: function () { return new Date;}}
    },
    relations: {
        accessTokens: {
            type: 'hasMany',
            model: 'AccessToken',
            foreignKey: 'userId'
        }
    }
};