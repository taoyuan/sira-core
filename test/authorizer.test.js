"use strict";

var sira = require('sira');
var s = require('./support');
var authorizer = require('../lib/authorizer');

describe('authorizer', function () {

    var sapp;
    beforeEach(function (done) {
        sapp = s.sapp();
        sapp.phase(authorizer);
        sapp.boot(done);
    });

//    it('should allow create user', function () {
//    });

});