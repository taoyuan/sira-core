"use strict";

var _ = require('lodash');
var veritoken = require('veritoken');

var DEFAULTS = {
    params: ['access_token'],
    headers: ['X-Access-Token', 'authorization'],
    cookies: ['access_token', 'authorization'],
    attr: 'accessToken'
};

module.exports = function (sappOrModel, options) {
    if (!sappOrModel) throw new Error('sapp or model must not be null');
    var Model;
    if (typeof sappOrModel === 'function') {
        Model = sappOrModel;
    } else if (typeof sappOrModel.model === 'function' && sappOrModel.models) {
        Model = sappOrModel.model('AccessToken');
    } else {
        throw new Error('Invalid Arguments');
    }


    options = _.defaults({}, DEFAULTS, options);
    return veritoken(options, function (tokenId, cb) {
        Model.findForId(tokenId, function (err, token) {
            cb(err, token);
        });
    });

};