"use strict";

var ctx = require('../lib/access-context');
var AccessContext = ctx.AccessContext;
var Principal = ctx.Principal;
var AccessRequest = ctx.AccessRequest;

// Role constant
exports.OWNER = '$owner'; // owner of the object
exports.RELATED = "$related"; // any User with a relationship to the object
exports.AUTHENTICATED = "$authenticated"; // authenticated user
exports.UNAUTHENTICATED = "$unauthenticated"; // authenticated user
exports.EVERYONE = "$everyone"; // everyone

exports.ALL = AccessContext.ALL;

exports.DEFAULT = AccessContext.DEFAULT; // Not specified
exports.ALLOW = AccessContext.ALLOW; // Allow
exports.ALARM = AccessContext.ALARM; // Warn - send an alarm
exports.AUDIT = AccessContext.AUDIT; // Audit - record the access
exports.DENY = AccessContext.DENY; // Deny

exports.READ = AccessContext.READ; // Read operation
exports.WRITE = AccessContext.WRITE; // Write operation
exports.EXECUTE = AccessContext.EXECUTE; // Execute operation

exports.USER = Principal.USER;
exports.APP = exports.APPLICATION = Principal.APPLICATION;
exports.ROLE = Principal.ROLE;
exports.SCOPE = Principal.SCOPE;