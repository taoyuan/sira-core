"use strict";

var s = require('./support');
var t = s.t;
var setupAccessControl = require('./fixtures/access-control/app');

describe.only('access control - integration', function () {

    var sapp;
    beforeEach(function () {
        sapp = setupAccessControl();
    });

    it('basic', function () {
        t(sapp);
    });

});
