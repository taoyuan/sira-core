"use strict";

module.exports = {
    "relations": {
        "transactions": {
            "model": "transaction",
            "type": "hasMany"
        },
        "user": {
            "model": "user",
            "type": "belongsTo",
            "foreignKey": "userId"
        }
    },
    "acls": [
        {
            "accessType": "*",
            "permission": "DENY",
            "principalType": "ROLE",
            "principalId": "$everyone"
        },
        {
            "accessType": "*",
            "permission": "ALLOW",
            "principalType": "ROLE",
            "principalId": "$owner"
        },
        {
            "permission": "DENY",
            "principalType": "ROLE",
            "principalId": "$owner",
            "property": "deleteById"
        }
    ],
    "public": true
};