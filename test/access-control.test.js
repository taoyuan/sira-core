"use strict";

var st = require('sira-test').local;
var s = require('./support');
var setupAccessControl = require('./fixtures/access-control/app');

var USER = {email: 'test@test.test', password: 'test'};
var CURRENT_USER = {email: 'current@test.test', password: 'test'};

describe('access control - integration', function () {

    st.beforeEach.withSapp(setupAccessControl());

    describe('users', function () {

        st.beforeEach.givenModel('user', USER, 'randomUser');

        st.it.shouldBeDeniedWhenCalledAnonymously('users.all');
        st.it.shouldBeDeniedWhenCalledUnauthenticated('users.all');
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'users.all');

        st.it.shouldBeDeniedWhenCalledAnonymously('users.findById', dataForUser);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('users.findById', dataForUser);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'users.findById', dataForUser);

        st.it.shouldBeAllowedWhenCalledAnonymously('users.create', newUserData());
        st.it.shouldBeAllowedWhenCalledByUser(CURRENT_USER, 'users.create', newUserData());

        st.it.shouldBeAllowedWhenCalledByUser(CURRENT_USER, 'users.logout');

        st.describe.whenCalledLocally('users.deleteById', function() {
            // `deleteById` is allowed for the owner, and the owner acl resolver requires `id` param,.
            // here no param provided, so the request should be denied.
            // Under rest mode, url will be DELETE /users/:id, so the request url should not be found.
            st.it.shouldBeDenied();
            // st.it.shouldNotBeFound();
        });

        st.it.shouldBeDeniedWhenCalledAnonymously('users.updateById', dataForUser);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('users.updateById', dataForUser);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'users.updateById', dataForUser);

        st.describe.whenLoggedInAsUser(CURRENT_USER, function() {
            beforeEach(function() {
                this.data = { id: this.user.id }
            });
            st.describe.whenCalledLocally('users.deleteById', function() {
                st.it.shouldBeAllowed();
            });
            st.describe.whenCalledLocally('users.updateById', function() {
                st.it.shouldBeAllowed();
            });
        });

        st.it.shouldBeDeniedWhenCalledAnonymously('users.deleteById', dataForUser);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('users.deleteById', dataForUser);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'users.deleteById', dataForUser);

        function dataForUser() {
            return {id: this.randomUser.id}
        }

        var userCounter;
        function newUserData() {
            userCounter = userCounter ? ++userCounter : 1;
            return {
                email: 'new-' + userCounter + '@test.test',
                password: 'test'
            };
        }
    });


    describe('banks', function () {
        st.beforeEach.givenModel('bank');

        st.it.shouldBeAllowedWhenCalledAnonymously('banks.all');
        st.it.shouldBeAllowedWhenCalledUnauthenticated('banks.all');
        st.it.shouldBeAllowedWhenCalledByUser(CURRENT_USER, 'banks.all');

        st.it.shouldBeAllowedWhenCalledAnonymously('banks.findById', dataForBank);
        st.it.shouldBeAllowedWhenCalledUnauthenticated('banks.findById', dataForBank);
        st.it.shouldBeAllowedWhenCalledByUser(CURRENT_USER, 'banks.findById', dataForBank);

        st.it.shouldBeDeniedWhenCalledAnonymously('banks.create');
        st.it.shouldBeDeniedWhenCalledUnauthenticated('banks.create');
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'banks.create');

        st.it.shouldBeDeniedWhenCalledAnonymously('banks.updateById', dataForBank);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('banks.updateById', dataForBank);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'banks.updateById', dataForBank);

        st.it.shouldBeDeniedWhenCalledAnonymously('banks.deleteById', dataForBank);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('banks.deleteById', dataForBank);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'banks.deleteById', dataForBank);

        function dataForBank() {
            return { id: this.bank.id };
        }
    });

    describe('accounts', function () {
        st.beforeEach.givenModel('account');

        st.it.shouldBeDeniedWhenCalledAnonymously('accounts.all');
        st.it.shouldBeDeniedWhenCalledUnauthenticated('accounts.all');
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'accounts.all');

        st.it.shouldBeDeniedWhenCalledAnonymously('accounts.findById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('accounts.findById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'accounts.findById', dataForAccount);


        st.it.shouldBeDeniedWhenCalledAnonymously('accounts.create');
        st.it.shouldBeDeniedWhenCalledUnauthenticated('accounts.create');
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'accounts.create');

        st.it.shouldBeDeniedWhenCalledAnonymously('accounts.updateById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('accounts.updateById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'accounts.updateById', dataForAccount);

        st.describe.whenLoggedInAsUser(CURRENT_USER, function() {
            beforeEach(function(done) {
                var self = this;

                // Create an account under the given user
                this.sapp.model('account').create({
                    userId: self.user.id,
                    balance: 100
                }, function(err, act) {
                    self.data = {id: act.id};
                    done();
                });

            });
            st.describe.whenCalledLocally('accounts.updateById', function() {
                st.it.shouldBeAllowed();
            });
            st.describe.whenCalledLocally('accounts.findById', function() {
                st.it.shouldBeAllowed();
            });
            st.describe.whenCalledLocally('accounts.deleteById', function() {
                st.it.shouldBeDenied();
            });
        });

        st.it.shouldBeDeniedWhenCalledAnonymously('accounts.deleteById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledUnauthenticated('accounts.deleteById', dataForAccount);
        st.it.shouldBeDeniedWhenCalledByUser(CURRENT_USER, 'accounts.deleteById', dataForAccount);

        function dataForAccount() {
            return {id: this.account.id};
        }
    });
});
