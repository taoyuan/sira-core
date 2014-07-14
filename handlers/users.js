"use strict";

var sira = require('sira');
var _ = require('lodash');

module.exports = function (app) {
    var users = this;
    app.on('models', function () {
        setup(users, app);
    });
};

function setup(users, app) {
    var User = app.models.User;

    users.login = _.bind(User.login, User);
    users.logout = _.bind(User.logout, User);
//    users.confirm = _.bind(User.confirm, User);
    users.resetPassword = _.bind(User.resetPassword, User);

    sira.expose(users.login, {
        accepts: [
            {arg: 'credentials', type: 'object', required: true, source: 'payload'}
        ],
        returns: {
            arg: 'accessToken', type: 'object', root: true, description:
                'The result AccessToken created on login.\n\n'
        },
        http: {verb: 'post'}
    });

    sira.expose(users.logout, {
        accepts: [
            {arg: 'access_token', type: 'string', required: true, source: function(ctx) {
                var req = ctx && ctx.request;
                var accessToken = req && (req.accessToken || req.token);
                return accessToken && accessToken.id;
            }, description:
                'Do not supply this argument, it is automatically extracted ' +
                'from request.'
            }
        ],
        http: {verb: 'all'}
    });

//    sira.expose(users.confirm, {
//        accepts: [
//            {arg: 'uid', type: 'string', required: true},
//            {arg: 'token', type: 'string', required: true}
//        ],
//        http: {verb: 'get', path: '/confirm'}
//    });

    sira.expose(users.resetPassword, {
        accepts: [
            {arg: 'options', type: 'object', required: true, source: 'payload'}
        ],
        http: {verb: 'post', path: '/reset'}
    });
}