/*jshint browser: true */
/*globals angular, console, window */

(function () {
    'use strict';

    var euc = encodeURIComponent;

    angular.module('frog', ['sky', 'ui.bootstrap', 'ui.router', 'ngAnimate', 'frog.frogApi', 'frog.templates', 'frog.resources', 'Debugging', 'frog.util', 'frog.list'])
        .config(authInterceptorConfig)
        .config(config)
        .run(['bbWindowConfig', 'customizable', '$state', function (bbWindowConfig, customizable) {

            // $state must be included as per https://github.com/angular-ui/ui-router/issues/679.
            // However, we do not need to use it. Including it like this without passing it to
            // the function prevents linting errors.
            // If additional parameters need to be added in the future, do not delete $state.

            bbWindowConfig.productName = customizable.getRootFolder();
    
        }])
        .controller('MainController', MainController);

    authInterceptorConfig.$inject = ["$httpProvider", 'frogApiProvider'];
    function authInterceptorConfig($httpProvider, frogApiProvider) {
        var frogApi = frogApiProvider.$get();
        $httpProvider.interceptors.push(frogApi.getAuthInterceptors());
    }

    config.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider', 'frogApiProvider', 'frogResources', '$compileProvider', 'bbViewKeeperConfig'];

    function config($locationProvider, $stateProvider, $urlRouterProvider, frogApiProvider, frogResources, $compileProvider, bbViewKeeperConfig) {

        bbViewKeeperConfig.hasOmnibar = false;

        var hrefSanitization,
            API;

        API = frogApiProvider.$get();

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        // Enable any additional URL protocols here.
        // tel and sms are needed for the prospect contact actions.
        // tel is a default protocol on my dev machine but I'm not convinced that is true for any browser.
        // Add it into the regex because having the same thing twice won't hurt anything.
        hrefSanitization = $compileProvider.aHrefSanitizationWhitelist();
        if (hrefSanitization && hrefSanitization.toString().indexOf("https?|") >= 0) {
            // cut off leading and trailing slash so it is a valid RegExp pattern.
            hrefSanitization = hrefSanitization.toString().substring(1, hrefSanitization.toString().length - 1);
            hrefSanitization = hrefSanitization.replace("https?|", "https?|sms|tel|");
            hrefSanitization = new RegExp(hrefSanitization);
        } else {
            hrefSanitization = /^\s*(https?|sms|ftp|mailto|tel|local|file|data|blob):/;
        }
        $compileProvider.aHrefSanitizationWhitelist(hrefSanitization);

        API.initialize();

        $stateProvider
            .state('prospects', {
                abstract: true,
                url: '',
                template: '<ui-view keep-scroll-pos />'
            })
            .state('prospects.myportfolio', {
                url: '/?databaseName',
                views: {
                    '': createProspectList(frogResources.portfolio_title)
                },
                params: {
                    databaseName: API.getDatabaseName()
                }
            })
            .state('prospects.myportfolio.searchinput', {
                url: 'search',
                views: {
                    'searchinput@prospects.myportfolio': {
                        controller: 'SearchInputController',
                        controllerAs: 'searchInput',
                        templateUrl: 'views/search/searchinput.html'
                    }
                }
            })
            .state('prospects.prospect', {
                url: '/{prospectId}?databaseName',
                resolve: {
                    prospectId: ['$stateParams', function ($stateParams) {
                        var prospectId = $stateParams.prospectId;

                        // The prospect ID may have a "slug" before the GUID, so just pick off the GUID.
                        prospectId = prospectId.substr(prospectId.length - 36);

                        return prospectId;
                    }],
                    prospectIdWithSlug: ['$stateParams', function ($stateParams) {
                        return $stateParams.prospectId;
                    }],
                    prospectName: ['$stateParams', function ($stateParams) {
                        var prospectName = $stateParams.prospectId;

                        // The prospect ID may have a "slug" before the GUID, so remove the GUID.
                        prospectName = prospectName.substr(0, prospectName.length - 36).replace(/-/g, " ").trim();

                        return prospectName;
                    }]
                },
                params: {
                    databaseName: API.getDatabaseName()
                },
                views: {
                    "": {
                        controller: 'ProspectPageController as prospectPage',
                        templateUrl: 'views/prospects/prospect.html'
                    },
                    "recentsteps@prospects.prospect": {
                        controller: "RecentStepsController",
                        templateUrl: "views/prospects/tiles/recentsteps.html"
                    },
                    "upcomingsteps@prospects.prospect": {
                        controller: "UpcomingStepsController",
                        templateUrl: "views/prospects/tiles/upcomingsteps.html"
                    },
                    "recentgiftsandcredits@prospects.prospect": {
                        controller: "RecentGiftsAndCreditsController",
                        templateUrl: "views/prospects/tiles/recentgiftsandcredits.html"
                    },
                    "summaryinformation@prospects.prospect": {
                        controller: "SummaryInformationController",
                        templateUrl: "views/prospects/tiles/summaryinformation.html"
                    }
                }
            });
        
        function createProspectList(pageTitle) {
            return {
                controller: 'ProspectListController',
                controllerAs: 'prospectList',
                templateUrl: 'views/prospects/prospectlist.html',
                resolve: {
                    pageTitle: function () {
                        return pageTitle;
                    }
                }
            };
        }

    }

    MainController.$inject = ['$scope', '$document', '$timeout', 'Routing', 'bbWait', 'frogApi', 'frogResources', '$location', 'customizable'];

    function MainController($scope, $document, $timeout, Routing, bbWait, frogApi, frogResources, $location, customizable) {
        var self = this;

        // These two attributes help with page navigation between tabs and using the browser back button.
        // The conditional was added to handle the case of refreshing a page or heading straight to the search page.
        if ($location.$$path === '/search') {
            self.portfolioActive = false;
            self.tabIndex = 1;
        } else {
            self.portfolioActive = true;
            self.tabIndex = 0;
        }

        Routing.active = false;

        bbWait.beginPageWait();

        frogApi.authenticateAsync(authenticateSuccess, authenticateFailure, authenticateFinally);

        function authenticateSuccess(sessionInfo) {
            $scope.sessionInfo = sessionInfo;
            setUpInactiveLogOut(sessionInfo.inactivityTimeout);
        }

        // This allows for state change between portfolio and search -- without this, the back button does not work.
        $scope.$on('$stateChangeStart', function (event, toState) {
            if (toState.name === 'prospects.myportfolio') {
                self.portfolioActive = true;
                self.tabIndex = 0;
                return;
            } else if (toState.name === 'prospects.myportfolio.searchinput') {
                self.portfolioActive = false;
                self.tabIndex = 1;
                return;
            } else {
                return;
            }
        });

        function authenticateFailure(error) {

            var message = "";

            if (error) {
                message = error.message || "";
            }

            // Error message from bbui-angular. WI# 669988.
            if (message === "You must either provide a baseUrl and databaseName as parameters or set them globally using bbuiShellServiceConfig.") {
                $scope.startError = frogResources.error_url;
            } else {
                $scope.startError = frogResources.error_general.format(message);
            }


        }

        function authenticateFinally() {
            bbWait.endPageWait();
        }

        function setUpInactiveLogOut(inactiveTimeoutSeconds) {
            if (!inactiveTimeoutSeconds) {
                return;
            }

            var LastActivityStorageKey,
                ActivityEvents = "mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll",
                fullUrl = $location.absUrl();

            LastActivityStorageKey = "BB_LastActivity_" + fullUrl.substring(0, fullUrl.indexOf("/sky/" + (customizable.isCustomApp() ? 'custom/' : '') + customizable.getRootFolder()));

            localStorage.setItem(LastActivityStorageKey, getTimeStampInSeconds());
            setTimeout(resetTimer, inactiveTimeoutSeconds * 1000);
            $document.on(ActivityEvents, onActivityEvent);

            function getTimeStampInSeconds() {
                return Date.now() / 1000;
            }

            function onActivityEvent() {
                localStorage.setItem(LastActivityStorageKey, getTimeStampInSeconds());
            }

            function resetTimer() {
                var timeDeltaSinceLastActivity = getTimeStampInSeconds() - parseInt(localStorage.getItem(LastActivityStorageKey), 10);

                if (timeDeltaSinceLastActivity >= inactiveTimeoutSeconds) {
                    doLogOut();
                } else {
                    setTimeout(resetTimer, (inactiveTimeoutSeconds - timeDeltaSinceLastActivity) * 1000);
                }
            }
        
            function doLogOut() {
                frogApi.logoutAsync()
                    .then(function (logoutWasSuccessful) {
                        if (logoutWasSuccessful) {
                            var url;
                            
                            url = (customizable.isCustomApp() ? '../' : '') + "../../webui/WebShellLogin.aspx?databaseName=" + euc(frogApi.getDatabaseName());
                            url += "&url=" + euc($location.absUrl()) + "&status=inactive";

                            // $location.replace() doesn't seem to work here so using window.location.replace directly
                            // Using replace keeps the login screen from showing up in the browser history.
                            window.location.replace(url);
                        } else {
                            console.log("The user was not logged out.  This is likely because custom authentication was not used, or the user was logged out by another tab.");
                        } 
                    })
                    .catch(function (error) {
                        console.warn("Logout failed. " + error.message);
                    })
                    .finally(function () {
                        $document.off(ActivityEvents, onActivityEvent);
                    });
            }
        }
    }

    // Tell Fallback JS that this script has loaded.
    window.FROG_READY = true;
    window.BBUI_READY = true;

}());
