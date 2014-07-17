"use strict";

module.exports = function () {
    var self = this;
    var remotes = this.__remotes;
    var authorize;

    this.on('ready', function () {
        authorize = authorizer(self.models);
    });

    remotes.before('**', function (ctx, next, method) {
        var req = ctx.request;
        var Model = method.ctor;
        var modelInstance = ctx.instance;
        var modelId = modelInstance && modelInstance.id || req.param('id');

        var modelSettings = Model.settings || {};
        var errStatusCode = modelSettings.aclErrorStatus || /*app.get('aclErrorStatus') ||*/ 401;
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

    /**
     * Check if the given access token can invoke the method
     *
     * @param {Object} token The access token
     * @param {*} modelId The model ID.
     * @param {SharedMethod} sharedMethod The method in question
     * @param {Function} cb The callback function (err, allowed)
     */
    return function (token, modelId, sharedMethod, cb) {
        cb(null, true);
    }
}