"use strict";

module.exports = function () {
    return {
        properties: {
            id: {type: String, id: true, generated: true}, // Id
            principalType: String, // The principal type, such as user, application, or role
            principalId: String // The principal id
        },
        relations: {
            role: {
                type: 'belongsTo',
                model: 'Role',
                foreignKey: 'roleId'
            }
        }
    }
};