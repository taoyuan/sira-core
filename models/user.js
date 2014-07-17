"use strict";

var SEC = require('../').security;

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

        // Timestamps
        created: {type: Date, default: function () { return new Date;}},
        updated: {type: Date, default: function () { return new Date;}}
    },
    relations: {
        accessTokens: {
            type: 'hasMany',
            model: 'AccessToken',
            foreignKey: 'userId'
        }
    },
    settings: {
        acls: [
            {
                principalType: SEC.ROLE,
                principalId: SEC.EVERYONE,
                permission: SEC.DENY
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.EVERYONE,
                permission: SEC.ALLOW,
                property: 'create'
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.OWNER,
                permission: SEC.ALLOW,
                property: 'removeById'
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.EVERYONE,
                permission: SEC.ALLOW,
                property: "login"
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.EVERYONE,
                permission: SEC.ALLOW,
                property: "logout"
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.OWNER,
                permission: SEC.ALLOW,
                property: "findById"
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.OWNER,
                permission: SEC.ALLOW,
                property: "updateAttributes"
            },
            {
                principalType: SEC.ROLE,
                principalId: SEC.EVERYONE,
                permission: SEC.ALLOW,
                property: "confirm"
            }
        ]
    }
};