"use strict";

var assert = require('assert');

var SEC = module.exports = exports = {};

// Role constant
SEC.OWNER = "$owner"; // owner of the object
SEC.RELATED = "$related"; // any User with a relationship to the object
SEC.AUTHENTICATED = "$authenticated"; // authenticated user
SEC.UNAUTHENTICATED = "$unauthenticated"; // authenticated user
SEC.EVERYONE = "$everyone"; // everyone

SEC.ALL = "*";

SEC.DEFAULT = "DEFAULT"; // Not specified
SEC.ALLOW = "ALLOW"; // Allow
SEC.ALARM = "ALARM"; // Warn - send an alarm
SEC.AUDIT = "AUDIT"; // Audit - record the access
SEC.DENY = "DENY"; // Deny

SEC.READ = "READ"; // Read operation
SEC.WRITE = "WRITE"; // Write operation
SEC.EXECUTE = "EXECUTE"; // Execute operation

SEC.USER = "USER";
SEC.APP = SEC.APPLICATION = "APP";
SEC.ROLE = "ROLE";
SEC.SCOPE = "SCOPE";

SEC.getAccessTypeForMethod = function getAccessTypeForMethod(method) {
    if (typeof method === 'string') {
        method = {name: method};
    }
    assert(typeof method === 'object', 'method is a required argument and must be a RemoteMethod object');

    switch (method.name) {
        case'create':
            return SEC.WRITE;
        case 'updateOrCreate':
            return SEC.WRITE;
        case 'upsert':
            return SEC.WRITE;
        case 'exists':
            return SEC.READ;
        case 'findById':
            return SEC.READ;
        case 'find':
            return SEC.READ;
        case 'findOne':
            return SEC.READ;
        case 'destroyById':
            return SEC.WRITE;
        case 'deleteById':
            return SEC.WRITE;
        case 'removeById':
            return SEC.WRITE;
        case 'count':
            return SEC.READ;
            break;
        default:
            return SEC.EXECUTE;
            break;
    }
};