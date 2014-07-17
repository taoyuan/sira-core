"use strict";

var sira = require('sira');
var s = require('./support');
var authorizer = require('../lib/authorizer');

describe('authorizer', function () {

    var app;
    beforeEach(function (done) {
        app = s.bootApp(done);
        app.phase(authorizer);
    });

//    it('should allow create user', function () {
//    });

});