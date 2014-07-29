"use strict";

var sec = require('../').security;

module.exports = {
    properties: {
        id: {type: String, index: true},
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
        created: {type: Date, default: function () {
            return new Date;
        }},
        updated: {type: Date, default: function () {
            return new Date;
        }}
    },
    relations: {
        accessTokens: {
            type: 'hasMany',
            model: 'AccessToken',
            foreignKey: 'userId'
        }
    },
    hidden: ['password'],
    acls: [
        {
            principalType: sec.ROLE,
            principalId: sec.EVERYONE,
            permission: sec.DENY
        },
        {
            principalType: sec.ROLE,
            principalId: sec.EVERYONE,
            permission: sec.ALLOW,
            property: 'create'
        },
        {
            principalType: sec.ROLE,
            principalId: sec.OWNER,
            permission: sec.ALLOW,
            property: 'deleteById'
        },
        {
            principalType: sec.ROLE,
            principalId: sec.EVERYONE,
            permission: sec.ALLOW,
            property: "login"
        },
        {
            principalType: sec.ROLE,
            principalId: sec.EVERYONE,
            permission: sec.ALLOW,
            property: "logout"
        },
        {
            principalType: sec.ROLE,
            principalId: sec.OWNER,
            permission: sec.ALLOW,
            property: "findById"
        },
        {
            principalType: sec.ROLE,
            principalId: sec.OWNER,
            permission: sec.ALLOW,
            property: "updateById"
        },
        {
            principalType: sec.ROLE,
            principalId: sec.OWNER,
            permission: sec.ALLOW,
            property: "updateAttributes"
        },
        {
            principalType: sec.ROLE,
            principalId: sec.EVERYONE,
            permission: sec.ALLOW,
            property: "confirm"
        }
    ]
};