"use strict";

var SEC = require('./security');

module.exports = function () {
    var sapp = this;
    var remotes = this.__remotes;
    var authorize;

    this.on('ready', function () {
        authorize = authorizer(sapp.models);
    });

    remotes.before('**', function (ctx, next, method) {
        var req = ctx.request;
        var Model = method.ctor;
        var modelInstance = ctx.instance;
        var modelId = modelInstance && modelInstance.id || req.param('id');

        var modelSettings = Model.settings || {};
        var errStatusCode = modelSettings.aclErrorStatus || sapp.options['aclErrorStatus'] || 401;
        if (!req.accessToken) {
            errStatusCode = 401;
        }

        authorize(
            req.accessToken,
            modelId,
            method,
            function (err, allowed) {
                if (err) return next(err);
                if (!allowed) {
                    var messages = {
                        403: 'Access Denied',
                        404: 'Could not find a model with id ' + modelId,
                        401: 'Authorization Required'
                    };

                    var e = new Error(messages[errStatusCode] || messages[403]);
                    e.statusCode = errStatusCode;
                    return next(e);
                }
                next();
            }
        );
    });
};

function authorizer(models) {

    var AccessToken = models['AccessToken'];
    var ACL = models['ACL'];
    /**
     * Check if the given access token can invoke the method
     *
     * @param {Object} token The access token
     * @param {*} modelId The model ID.
     * @param {SharedMethod} sharedMethod The method in question
     * @param {Function} cb The callback function (err, allowed)
     */
    return function (token, modelId, sharedMethod, cb) {
        var ANONYMOUS = models.AccessToken.ANONYMOUS;
        token = token || ANONYMOUS;
        ACL.checkAccessForContext({
            accessToken: token,
            model: sharedMethod.ctor,
            property: sharedMethod.name,
            method: sharedMethod.name,
            sharedMethod: sharedMethod,
            modelId: modelId,
            accessType: SEC.getAccessTypeForMethod(sharedMethod)
        }, function (err, accessRequest) {
            if (err) return cb(err);
            cb(null, accessRequest.isAllowed());
        });
    }
}
