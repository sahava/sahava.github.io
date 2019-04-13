/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../typings/google.analytics/ga.d.ts" />
//You should realy get rid of this file when you can.
//It's all included in the ui-js-core repo. That version works much nicer too.
//
//This has been re-written for OAuth and because it was unstable.
(function ($) {
    $.fn.messageCenterHeaderWidget = function () {
        //If ui-js-core is loaded on this page, do nothing. Let the web app do it.
        if ("App" in window) {
            return this;
        }
        /**
         * Store the AccessToken from the OAuth service. Will be false if unset.
         * @type {False || String}
         */
        var AccessToken = false;
        /**
         * Counter for how long it's been since last poll
         * @type {interval}
         */
        var pollTimer;
        /**
         * Flag for if currently requesting updates
         * @type {Boolean}
         */
        var polling = false;
        /**
         * What element to target for update on the page
         * @param {$} '.messagecenterheaderwidget a'
         */
        var $el = $('.messagecenterheaderwidget a');
        /**
         * Ghetto but fast element creation for the count badge
         * @param {string} '<span class="msg-unread-stamp"></span>'
         */
        var $template = '<span class="msg-unread-stamp"></span>';
        /**
         * Has the $template been added to the dom?
         * @type {Boolean}
         */
        var isRendered = false;
        /**
         * Deffered token request. Will short out if a valid token is already stored
         * @param {Boolean} isRefresh Should we get a new token? Used for 401 rollovers
         * @returns {Promise}
         */
        var getAccessToken = function (isRefresh) {
            var dfd = $.Deferred();
            if (!isRefresh && AccessToken) {
                dfd.resolve(AccessToken);
            }
            $.ajax({
                url: "/account/oauth/token",
                dataType: 'json',
                type: 'POST',
                timeout: 10000,
                success: function (r) {
                    AccessToken = r.access_token;
                    dfd.resolve(AccessToken);
                },
                error: function (e) {
                    console.warn("MESSAGE CENTER HEADER WIDGET: Token Error", e);
                }
            });
            return dfd;
        };
        /**
         * Get the UserModel. Commservice Endpoint, accountId
         * @returns {Promise}
         *          accessToken: "OLD TOKEN, DONT USE"
         *          accountPublicGuid:"GUID-GUID-GUID-GUID"
         *          communicationServiceEndpoint:"http://localhost:1337/api/" Junk, use NoCors
         *          communicationServiceEndpointNoCors:"http://localhost:1337/api/"
         *          idleDeactivationDurationHours:1
         *          idleDurationSeconds:300
         *          idlePollingIntervalSeconds:300
         *          pollingIntervalSeconds:15
         */
        var getParams = function () {
            return $.ajax({
                headers: { 'Authorization': "bearer " + AccessToken },
                crossDomain: true,
                dataType: "jsonp",
                url: "/account/messagecenter/headerwidget/params"
            });
        };
        /**
         * Stored from GetParams
         * @type {Object}
         */
        var UserModel = {};
        /**
         *
         * @param {[type]} userModel [description]
         * @returns {Promise}
         *          lastConversationActivityDateUtc:"2016-08-04T20:30:42.6599985Z"
         *          publicGuid:"47975ebd-efc1-40d6-94c1-b379a6221a8f"
         *          unreadConversationCount:1
         *          unreadConversationSummaries:[
         *              0:{
         *                  id:"7b124dd4-4535-47f4-bc0c-e155fcac3809"
         *                  lastMessageCreatedBy:"4947e057-e378-4b42-8b4f-6489c19b1c9a"
         *                  lastMessageDate:"2016-08-04T20:30:42.6599985Z"
         *                  lastMessageId:"636059394426599985"
         *              }
         *          ]
         */
        var getSummary = function (userModel) {
            return $.ajax(userModel.communicationServiceEndpointNoCors + "participant/" + userModel.accountPublicGuid + "/summary", {
                type: "GET",
                dataType: "json",
                headers: { 'Authorization': "bearer " + AccessToken }
            });
        };
        /**
         * Init the polling functions. Will use idle steps defined on UserModel
         */
        var startPolling = function (UserModel) {
            var isIdle = false;
            var pollClock = 0;
            polling = true;
            /**
             * getInterval logic. Uses currentStep to start a new setTimeout based on how long pollTimer has been runing.
             */
            var timerAction = function () {
                var currentStep; //how long untill we should poll again
                if (pollClock < UserModel.idleDurationSeconds) {
                    pollClock += UserModel.pollingIntervalSeconds;
                    currentStep = UserModel.pollingIntervalSeconds * 1000;
                }
                else if (pollClock < UserModel.idleDeactivationDurationHours * 3600) {
                    pollClock += UserModel.idlePollingIntervalSeconds;
                    currentStep = UserModel.idlePollingIntervalSeconds * 1000;
                }
                else {
                    //if the user comes back, start polling again.
                    $(window).one('click mouseenter', startPolling);
                    clearTimeout(pollTimer);
                    return;
                }
                poll(UserModel)
                    .done(function () {
                    pollTimer = setTimeout(timerAction, currentStep);
                });
            };
            pollTimer = setTimeout(timerAction, 0); //fire right away at first
        };
        /**
         * Kill the pollTimer
         */
        var stopPolling = function () {
            polling = false;
            clearTimeout(pollTimer);
        };
        var poll = function (UserModel) {
            var prevCount = UserModel.prevCount || 0;
            if (polling) {
                return getSummary(UserModel)
                    .then(function (r) {
                    if (r.unreadConversationCount > 0 && r.unreadConversationCount != prevCount) {
                        render(r);
                    }
                    UserModel.prevCount = r.unreadConversationCount;
                }, function (jqXHR, textStatus, error) {
                    stopPolling();
                    if (jqXHR.status === 401) {
                        destroy();
                        init(); //start over
                    }
                });
            }
            else {
                return $.Deferred();
            }
        };
        /**
         * Fired if there is unread convos. Change the badge text, or add/remove it.
         * @param {object} summary The response from poll()
         */
        var render = function (summary) {
            if (!isRendered) {
                $el.prepend($template);
                isRendered = true;
            }
            else if (summary.unreadConversationCount === 0) {
                $el.children('.msg-unread-stamp').remove();
                isRendered = false;
            }
        };
        //get a token and kick off the plugin
        var init = function () {
            //if there is no widget in the dom, do nothing
            if ($el.length == 0) {
                return; //accounts for logged out inconsistencies
            }
            getAccessToken(true)
                .done(function () {
                getParams()
                    .done(function (response) {
                    UserModel = response;
                    startPolling(UserModel);
                });
            });
            //bind analytics
            if ("ga" in window) {
                $el.on('click', function () {
                    ga('send', 'event', 'Message Center', 'Click', 'Message Center Header Widget', { transport: 'beacon' });
                });
            }
        };
        /**
         * Cleanup the plugin
         */
        var destroy = function () {
            stopPolling();
            AccessToken = false;
        };
        //1, 2, 3, GO!
        init();
        return this;
    };
})(jQuery);
//# sourceMappingURL=message-center-header-widget.js.map