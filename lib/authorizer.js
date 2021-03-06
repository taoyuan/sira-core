"use strict";

var sec = require('./security');

module.exports = function () {
    var sapp = this;
    var remotes = this.remotes;
    var authorize = authorizer(sapp);

    remotes.before('**', function (ctx, next, method) {
        var req = ctx.request;
        var Model = method.ctor;
        var modelInstance = ctx.instance;
        var modelId = modelInstance && modelInstance.id || req.param('id');

        var modelSettings = Model.settings || {};
        var errStatusCode = modelSettings.aclErrorStatus || sapp.get('aclErrorStatus') || 401;
        if (!req.accessToken) {
            errStatusCode = 401;
        }

        authorize(
            req.accessToken,
            modelId,
            method,
            ctx,
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

function authorizer(sapp) {

    /**
     * Check if the given access token can invoke the method
     *
     * @param {Object} token The access token
     * @param {*} modelId The model ID.
     * @param {SharedMethod} sharedMethod The method in question
     * @param {Object} [ctx] The remotes context
     * @param {Function} cb The callback function (err, allowed)
     */
    return function (token, modelId, sharedMethod, ctx, cb) {
        if (typeof ctx === 'function') {
            cb = ctx;
            ctx = null
        }
        ctx = ctx || {};
        var AccessToken = sapp.models['AccessToken'];
        var ACL = sapp.models['ACL'];
        var ANONYMOUS = AccessToken.ANONYMOUS;
        token = token || ANONYMOUS;
        ACL.checkAccessForContext({
            accessToken: token,
            model: sharedMethod.ctor,
            property: sharedMethod.name,
            method: sharedMethod.name,
            sharedMethod: sharedMethod,
            modelId: modelId,
            accessType: sec.getAccessTypeForMethod(sharedMethod),
            remoteContext: ctx
        }, function (err, accessRequest) {
            if (err) return cb(err);
            cb(null, accessRequest.isAllowed());
        });
    }
}
