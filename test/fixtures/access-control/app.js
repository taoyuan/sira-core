"use strict";
var sira = require('sira');
var authorizer = require('../../../').authorizer;

module.exports = function (cb) {
    var sapp = sira();
    sapp.phase(sira.boot.module('./'));
    sapp.phase(sira.boot.module(__dirname));
    sapp.phase(sira.boot.database());
    sapp.phase(function () {
        sapp.use(sapp.dispatcher);
        sapp.use(function (ctx) {
            if (!ctx.handled) throw new Error('Unhandled request ' + ctx.request.uri);
        });
    });
    sapp.phase(authorizer);

    sapp.boot(cb);
    return sapp;
};

