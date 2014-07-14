"use strict";

var sira = require('sira');
var chai = exports.chai = require('chai');
chai.config.includeStack = true;

var t = exports.t = chai.assert;

exports.bootApp = function (options, done) {
    if (typeof options === "function") {
        done = options;
        options = null;
    }
    options = options || {};
    options.db = options.db || {
        driver: 'redis-hq'
    };

    var app = new sira.Application;
    app.phase(sira.boot.component('./'));
    app.phase(sira.boot.database(options.db));
    app.phase(function () {
        app.use(app.dispatcher);
    });
    app.boot(function (err) {
        done(err, app);
    });
    return app;
};