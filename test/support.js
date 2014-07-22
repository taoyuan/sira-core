"use strict";

var sira = require('sira');
var async = require('async');
var chai = exports.chai = require('chai');
chai.config.includeStack = true;

var authorizer = require('../').authorizer;

var t = exports.t = chai.assert;

t.plan = function (count, done) {
    return function () {
        if (--count === 0) done();
    }
};

exports.bootApp = function (options, done) {
    if (typeof options === "function") {
        done = options;
        options = null;
    }
    options = options || {};
    options.db = options.db || {
        driver: 'redis-hq'
    };

    var sapp = new sira.Application;
    sapp.phase(sira.boot.module('./'));
    sapp.phase(sira.boot.database(options.db));
    sapp.phase(function () {
        sapp.use(sapp.dispatcher);
    });
    sapp.phase(authorizer);

    if (options.beforeBoot) {
        options.beforeBoot(sapp);
    }

    if (options.sync) {
        sapp.boot(options, function (err) {
            done(err, sapp);
        });
    } else {
        process.nextTick(function () {
            sapp.boot(options, function (err) {
                done(err, sapp);
            });
        });
    }

    return sapp;
};

exports.bootAppSync = function (options, done) {
    if (typeof options === "function") {
        done = options;
        options = null;
    }
    options = options || {};
    options.sync = true;
    return exports.bootApp(options, done);
};

exports.destroyAll = function (models, done) {

    if (!(Array.isArray(models))) {
        models = [models];
    }
    done = done || function () {};

    async.series(models.map(function (Model) {
        return function (callback) {
            Model.destroyAll(callback);
        }
    }), done);
};