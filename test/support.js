"use strict";

var _ = require('lodash');
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

exports.sapp = function (options) {
    options = options || {};
    options.db = options.db || {
        driver: 'redis-hq'
    };

    var sapp = new sira.Application;
    sapp.setAll(options);
    sapp.phase(sira.boot.module('./'));
    sapp.phase(sira.boot.database(options.db));
    sapp.phase(authorizer);
    return sapp;
};

exports.cleanup = function (sappOrModels, done) {
    var models = sappOrModels;
    if (sappOrModels.models) {
        models = _.values(sappOrModels.models);
    } else if (!(Array.isArray(sappOrModels))) {
        models = [sappOrModels];
    }

    done = done || function () {};

    async.eachSeries(models, function (Model, callback) {
        Model.destroyAll(callback);
    }, done);
};