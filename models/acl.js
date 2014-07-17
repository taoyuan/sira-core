"use strict";

module.exports = function () {
    return {
        name: 'ACL',
        properties: {
            model: String, // The name of the model
            property: String, // The name of the property, method, scope, or relation

            /**
             * Name of the access type - READ/WRITE/EXEC
             * @property accessType {String} Name of the access type - READ/WRITE/EXEC
             */
            accessType: String,

            /**
             * ALARM - Generate an alarm, in a system dependent way, the access specified
             * in the permissions component of the ACL entry.
             * ALLOW - Explicitly grants access to the resource.
             * AUDIT - Log, in a system dependent way, the access specified in the
             * permissions component of the ACL entry.
             * DENY - Explicitly denies access to the resource.
             */
            permission: String,
            /**
             * Type of the principal - Application/User/Role
             */
            principalType: String,
            /**
             * Id of the principal - such as appId, userId or roleId
             */
            principalId: String
        }
    }
};