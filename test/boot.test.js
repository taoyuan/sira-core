"use strict";

var sira = require('sira');
var s = require('./support');
var t = s.t;

describe('boot', function () {

    it('should load component resources', function (done) {
        var app = new sira.Application;
        app.phase(sira.boot.component('./'));
        app.phase(sira.boot.database());
        app.boot(function (err) {
            t(app.models.User);
            done(err);
        });

    });

});