"use strict";

var DEFAULT_TTL = 1209600; // 2 weeks in seconds

module.exports = {
    name: 'AccessToken',
    properties: {
        id: { type: String },
        ttl: { type: Number, default: DEFAULT_TTL },
        created: { type: Date, default: Date.now }
    },
    relations: {
        user: {
            type: 'belongsTo',
            model: 'User',
            foreignKey: 'userId'
        }
    }

};