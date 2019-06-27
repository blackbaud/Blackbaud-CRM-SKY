/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    var GUID_EMPTY = '00000000-0000-0000-0000-000000000000',
        noop = angular.noop,
        ProspectIdRequiredMessage = "prospectId is required";

    function requestFailure(reply, failureCallback) {
        var result = {};

        if (reply && reply.data && reply.data.message) {
            result.message = reply.data.message;
        }

        failureCallback(result);
    }

    // Using this function in order to keep from accidentally modifying an options object passed into a function.
    function cloneOrNew(bbui, options) {
        if (options) {
            return bbui.clone(options);
        }

        return {};
    }

    function toUpperIdOrNullIfEmpty(id) {
        if (!id || id === GUID_EMPTY) {
            return null;
        }

        return id.toUpperCase();
    }

    function getFullName(frogResources, firstName, keyName) {
        if (firstName) {
            return frogResources.name_format.format(firstName, keyName);
        }

        return keyName;
    }

    angular.module("frog.api", ["frog.util", "bbui", "sky.moment", "frog.resources"])
        .factory("apiCache", ["$cacheFactory", function ($cacheFactory) {

            var cache;

            cache = $cacheFactory.get('bbcrm');
            if (!cache) {
                cache = $cacheFactory('bbcrm');
            }

            return {
                cache: cache
            };

        }])

        .factory("apiAuthenticate", ["infinityUtilities", "browserUtilities", "bbuiShellService", "$q",
            function (infinityUtilities, browserUtilities, bbuiShellService, $q) {

                var svc,
                    authenticateSuccessCallback,
                    authenticateFailureCallback,
                    authenticateFinallyCallback,
                    FORMS_AUTH_HEADER = "X-BB-FormsAuth";

                function sessionStartSuccess(reply) {
                    authenticateSuccessCallback(reply.data);
                    authenticateFinallyCallback();
                }

                function sessionStartFailure(data, status, headers) {

                    var //formsAuthInUse,
                        redirectUrl;
                    //wsFederationEnabled,
                    //authHeader,
                    //isBearerAuthenticated,
                    //homePageUrl;

                    //homePageUrl = BBUI.urlConcat(svc.baseUrl, "browser/Default.aspx");
                    //homePageUrl += "?DatabaseName=" + encodeURIComponent(svc.databaseName);

                    //wsFederationEnabled = false;
                    // TODO CEV
                    //if (BBUI && BBUI.globals && BBUI.globals._auth) {
                    //    wsFederationEnabled = !!BBUI.globals._auth.wsFederationEnabled;
                    //}

                    // TODO CEV
                    //authHeader = request.getResponseHeader("WWW-Authenticate");
                    //isBearerAuthenticated = authHeader && authHeader === "Bearer";

                    //When using Federated Authentication, there may be a "Bearer" WWW-Authenticate header;
                    //But if the session start failed, all we can do is display the error on the login/migration form
                    //formsAuthInUse = (!authHeader || isBearerAuthenticated) || wsFederationEnabled;

                    // Unathorized (401)
                    // NotFound (404) implies WSFederation Authenticated but unable to match to AppUser
                    if ((status === 401) || (status === 404)) {

                        //if (formsAuthInUse) {
                        // Forms authentication is configured on the server.  Redirect to the login page.
                        redirectUrl = infinityUtilities.getWebShellLoginUrl(svc.databaseName, headers(FORMS_AUTH_HEADER));
                        //} else {
                        //    // Basic authentication is enabled and the user probably canceled the browser's
                        //    // credentials prompt.  Redirect to the start page.
                        //    redirectUrl = homePageUrl;
                        //}
                        browserUtilities.redirect(redirectUrl);
                        authenticateFinallyCallback();
                        // Don't call failure callback because we're just redirecting anyway.
                    } else {
                        // Not totally sure what the response object looks like with non-401 error codes.
                        // I think this should get the user something that is mildly helpful.
                        if (!data || !data.message) {
                            data = {
                                message: data
                            };
                        }
                        authenticateFailureCallback(data);
                        authenticateFinallyCallback();
                        //$(document.body).html(Res.getEncodedString("Viewport_NavigationLoadFail", false, error.message));
                    }

                }

                function startSession() {

                    // Need to save HTTP object since we need to do both .then and .error,
                    // which are not supported together.
                    var http = svc.sessionStart();

                    http.then(sessionStartSuccess);

                    http.error(sessionStartFailure);

                }

                function authenticateAsync(successCallback, failureCallback, finallyCallback) {

                    authenticateSuccessCallback = successCallback || noop;
                    authenticateFailureCallback = failureCallback || noop;
                    authenticateFinallyCallback = finallyCallback || noop;

                    var httpHeaders = {};

                    // Add a custom HTTP header to all requests so the server will send back a 401 response without a challenge
                    // header when the user logs in unsuccessfully.  This will keep the user from being prompted for credentials
                    // by the browser.
                    httpHeaders[FORMS_AUTH_HEADER] = "true";

                    try {

                        svc = bbuiShellService.create(null, null, {
                            httpHeaders: httpHeaders
                        });

                        startSession();

                    } catch (ex) {
                        failureCallback(ex);
                        finallyCallback();
                    }

                }

                /**
                 * Log out of the application.
                 * 
                 * @returns {Promise<Boolean>} return True if the logout was successful. Unsuccessful logout typically means the user is not using custom authentication.
                 */
                function logoutAsync() {
                    return bbuiShellService
                        .create()
                        .logout()
                        .then(function (reply) {
                            return reply.data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            $q.reject(error);
                        });
                }

                return {
                    authenticateAsync: authenticateAsync,
                    logoutAsync: logoutAsync
                };

            }])

        .factory("apiPortfolio", ["bbuiShellService", "frogResources", "prospectUtilities", "apiCache", "bbui", "$q",
            function (bbuiShellService, frogResources, prospectUtilities, apiCache, bbui, $q) {

                var svc,
                    FUNDRAISER_IDMAP_ID = 'C606C99A-FE2F-4F3E-AB48-3F4463344E92', // AppUser.Fundraiser.IDMapper.xml
                    MYPORTFOLIO_DATALIST_ID = "da329c8b-773c-4501-8329-77047018f6a9", // FundraiserPortfolio.Mobile.DataList.xml
                    MYPORTFOLIOSETTINGS_VIEW_ID = "cc816f72-b91e-452c-b715-aa15a676e98d"; // FundraiserPortfolio.Mobile.DataList.Settings.View.xml

                /**
                 * Transforms data list load results to an array of prospects.
                 * 
                 * @param {Object[]} dataListResults
                 * @param {String} dataListResults[].id The prospect's system ID.
                 * @param {String} dataListResults[].keyName The prospect's key name.
                 * @param {String} dataListResults[].firstName The prospect's first name.
                 * @param {Date} dataListResults[].nextStepDate The date of the prospect's next step or interaction.
                 * 
                 * @returns {Object[]} prospects
                 * @returns {String} prospects[].name The formatted name of the prospect.
                 * @returns {String} prospects[].id The prospect's system ID.
                 * @returns {Date} prospects[].nextStepDate The date of the next step or interaction on the prospect.
                 */
                function transformProspects(dataListResults) {
                    var prospects = [];

                    dataListResults.rows.forEach(function (row) {
                        // 0 PROSPECTID
                        // 1 PROSPECTKEYNAME
                        // 2 PROSPECTFIRSTNAME
                        // 3 NEXTSTEPDATE
                        // 4 NEXTSTEPTIME
                        var prospectValues = row.values;

                        prospects.push({
                            name: getFullName(frogResources, prospectValues[2], prospectValues[1]),
                            id: prospectValues[0].toUpperCase(),
                            nextStepDate: prospectValues[3]
                        });
                    });

                    prospectUtilities.setUp(prospects);

                    return {
                        prospects: prospects
                    };
                }

                function transformOptionalFilterFields(value) {

                    value = value || [];

                    var optionalFilterFields = [];

                    value.forEach(function (optionalFilterFieldsDfi) {
                        var optionalFilterField = {};
                        optionalFilterFieldsDfi.forEach(function (dfi) {
                            switch (dfi.name) {
                                case "FIELDID":
                                    optionalFilterField.fieldId = dfi.value;
                                    break;
                            }
                        });
                        optionalFilterFields.push(optionalFilterField);
                    });

                    return optionalFilterFields;
                }

                /**
                 * Get the prospect portfolio of the current app user, a fundraiser.
                 * 
                 * @param {Object} options
                 * @param {Boolean} [options.onlyPrimary=false] Only include primary prospects.
                 * @param {Number} [options.sort=0] Use 0 for "Last name" and 1 for "Next step."
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.prospects
                 * @returns {String} return.prospects[].id The prospect's system ID.
                 * @returns {String} return.prospects[].name The formatted name of the prospect.
                 * @returns {Date} return.prospects[].nextStepDate The date of the next step or interaction on the prospect.
                 */
                function getPortfolioAsync(options) {
                    options = cloneOrNew(bbui, options);
                    options.onlyPrimary = !!options.onlyPrimary;
                    options.sort = options.sort || 0;

                    var deferred = $q.defer();
                    svc = bbuiShellService.create();

                    // Cannot cache this because we don't have the app user's ID.
                    svc.idMap(FUNDRAISER_IDMAP_ID, 0) // Current app user ID
                        .then(function (idMapReply) {
                            var fundraiserId = idMapReply.data.id,
                                cacheKey,
                                cacheResult;

                            if (fundraiserId) {
                                fundraiserId = fundraiserId.toUpperCase();

                                cacheKey = "dataListLoad-" + MYPORTFOLIO_DATALIST_ID + "-" + fundraiserId + "-onlyPrimary:" + options.onlyPrimary + ";" + "sort:" + options.sort;
                                cacheResult = apiCache.cache.get(cacheKey);

                                if (cacheResult) {
                                    deferred.resolve(cacheResult);
                                    return;
                                }

                                svc.dataListLoad(
                                    MYPORTFOLIO_DATALIST_ID,
                                    fundraiserId,
                                    {
                                        parameters: [
                                            {
                                                name: "ONLYPRIMARY",
                                                value: options.onlyPrimary
                                            },
                                            {
                                                name: "SORT",
                                                value: options.sort
                                            }
                                        ],
                                        userSettingsPath: "app:sky-frog/page:portfolio/datalist:" + MYPORTFOLIO_DATALIST_ID
                                    }
                                )
                                    .then(function (reply) {
                                        var data = transformProspects(reply.data);
                                        apiCache.cache.put(cacheKey, bbui.clone(data));
                                        deferred.resolve(data);
                                    })
                                    .catch(function (reply) {
                                        var error = { message: "" };

                                        if (reply && reply.data && reply.data.message) {
                                            error.message = reply.data.message;
                                        }

                                        deferred.reject(error);
                                    });
                            } else {
                                // App user is not linked to a constituent and/or fundraiser.
                                deferred.reject({
                                    message: frogResources.error_portfolio_usernotlinked
                                });
                            }
                        })
                        .catch(function (idMapReply) {
                            deferred.reject({
                                message: frogResources.error_portfolio_unknownmapping.format(idMapReply.data.message)
                            });
                        });

                    return deferred.promise;
                }

                /**
                 * Get the portfolio list settings for the current user.
                 *
                 * @param {Function} successCallback Function to call if the try is successful.
                 * @param {Function} failureCallback Function to call if the try is not successful.
                 * @param {Function} finallyCallback Function to call at the end, regardless of the try's outcome.
                 *
                 * @return {Object} return
                 * @return {Boolean} return.onlyPrimary Only include primary prospects.
                 * @return {Number} return.sort Returns 0 for "Last name" and 1 for "Next step."
                 */
                function getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback) {

                    successCallback = successCallback || noop;
                    failureCallback = failureCallback || noop;
                    finallyCallback = finallyCallback || noop;

                    svc = bbuiShellService.create();

                    // Do not cache this because it changes with every data list load.
                    svc.dataFormLoad(MYPORTFOLIOSETTINGS_VIEW_ID)
                        .then(function (reply) {

                            var result = {};
                            result.onlyPrimary = false;
                            result.sort = 0;

                            if (reply && reply.data && reply.data.values) {
                                reply.data.values.forEach(function (dfi) {
                                    switch (dfi.name) {
                                        case "FILTER_ONLYPRIMARY":
                                            result.onlyPrimary = dfi.value;
                                            break;
                                        case "SORT":
                                            result.sort = dfi.value;
                                            break;
                                    }
                                });
                            }

                            successCallback(result);

                        })
                        .catch(function (failureData) {
                            // The form failed to load for some reason. Maybe insufficient rights.
                            failureCallback(failureData);
                        })
                        .finally(function () {
                            finallyCallback();
                        });
                }

                /**
                 * Get search list information for the given search list.
                 *
                 * @param {String} searchListId The search list whose information is desired.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.optionalFilterFields The optional filter fields in use on the search list.
                 * @returns {String} return.optionalFilterFields[].fieldId The field ID of the optional filter field.
                 */
                function getConstituentSearchListInformationAsync(searchListId) {
                    var SearchListInformationViewId = "48861a67-60fe-4438-b725-0ee3418eebbf", // SearchListInformation.Mobile.View.xml
                        cacheKey,
                        cacheResult;

                    if (!searchListId || typeof searchListId !== "string") {
                        return $q.reject({
                            message: "searchListId is required"
                        });
                    }

                    searchListId = searchListId.toUpperCase();

                    cacheKey = "dataFormLoad-" + SearchListInformationViewId + "-" + searchListId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(
                        SearchListInformationViewId,
                        {
                            recordId: searchListId
                        }
                    ).then(function (reply) {
                        var result = {};

                        if (reply && reply.data && reply.data.values) {
                            reply.data.values.forEach(function (dfi) {
                                switch (dfi.name) {
                                    case "OPTIONALFILTERFIELDS":
                                        result.optionalFilterFields = transformOptionalFilterFields(dfi.value);
                                        break;
                                }
                            });
                        }

                        apiCache.cache.put(cacheKey, bbui.clone(result));
                        return result;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get the search results for the user.
                 *
                 * @param {Object} options
                 * @param {Object[]} options.parameters The search list parameters to be used.
                 * @param {String} options.parameters[].id The field ID of the search list parameter.
                 * @param {Object} options.parameters[].value The value for that parameter.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.searchResults
                 * @returns {String} return.searchResults[].id The prospect's system ID.
                 * @returns {String} return.searchResults[].fullName The prospect's full name.
                 * @returns {String} return.searchResults[].city The prospect's address' city.
                 * @returns {String} return.searchResults[].state The prospect's address' state.
                 * @returns {String} return.searchResults[].postCode The prospect's address' post/ZIP code.
                 */
                function getConstituentSearchResultsAsync(options) {
                    var SEARCH_DATALIST_ID = "5c14275b-01f7-44ec-9707-e076cea1d361";  // ProspectSearch.Mobile.DataList.xml

                    options = cloneOrNew(bbui, options);

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        SEARCH_DATALIST_ID,
                        undefined,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                constituentSearchResult,
                                constituentSearchResults = [],
                                displayAddress;

                            data = {
                                constituentSearchResults: constituentSearchResults
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                constituentSearchResult = reply.data.rows[i].values;

                                // Set displayAddress to use for ng-if in HTML.
                                if (!constituentSearchResult[2] || !constituentSearchResult[3] || !constituentSearchResult[4]) {
                                    displayAddress = false;
                                } else {
                                    displayAddress = true;
                                }

                                constituentSearchResults.push({
                                    id: toUpperIdOrNullIfEmpty(constituentSearchResult[0]),
                                    fullName: constituentSearchResult[1],
                                    city: constituentSearchResult[2],
                                    state: constituentSearchResult[3],
                                    postCode: constituentSearchResult[4],
                                    displayAddress: displayAddress
                                });
                            }
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of countries known by the CRM database.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.countries
                 * @returns {Object[]} return.data.countries[].id The country's system ID.
                 * @returns {Object[]} return.data.countries[].description The country name.
                 * */
                function getCountriesListAsync() {
                    var COUNTRY_SIMPLELIST_ID = "C9649672-353D-42E8-8C25-4D34BBABFBBA", //CountrySimpleList.xml
                        cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + COUNTRY_SIMPLELIST_ID;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(COUNTRY_SIMPLELIST_ID)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                country,
                                countries = [];

                            data = {
                                countries: countries
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                country = reply.data.rows[i];

                                countries.push({
                                    id: country.value.toUpperCase(),
                                    description: country.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        },

                            function (reply) {
                                var error = { message: "" };

                                if (reply && reply.data && reply.data.message) {
                                    error.message = reply.data.message;
                                }
                                return $q.reject(error);
                            });

                }

                /**
                 * Get a list of states based on the given country.
                 * 
                 * @param {String} countryId The country's system ID.
                 * @param {Object} options
                 * @param {String} options.includeInactive Include inactive countries.
                 * @param {String} options.useDefaultCountry Use the default country.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.states
                 * @returns {Object[]} return.data.states[].id The state's system ID.
                 * @returns {Object[]} return.data.states[].abbreviation The state abbreviation.
                 */
                function getStatesListAsync(countryId, options) {

                    var STATEABBREVIATION_SIMPLELIST_ID = "7FA91401-596C-4F7C-936D-6E41683121D7", //StateAbbreviationSimpleList.xml,
                        cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + STATEABBREVIATION_SIMPLELIST_ID + "-" + countryId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = cloneOrNew(bbui, options);
                    if (countryId) {
                        angular.extend(options, {
                            parameters: [
                                {
                                    name: "COUNTRYID",
                                    value: countryId
                                }
                            ]
                        });

                    } else {
                        angular.extend(options);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        STATEABBREVIATION_SIMPLELIST_ID,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                state,
                                states = [];

                            data = {
                                states: states
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                state = reply.data.rows[i];

                                data.states.push({
                                    id: state.value.toUpperCase(),
                                    abbreviation: state.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        },

                            function (reply) {
                                var error = { message: "" };

                                if (reply && reply.data && reply.data.message) {
                                    error.message = reply.data.message;
                                }
                                return $q.reject(error);
                            });
                }

                /**
                 * Get the system ID of the default country.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.result
                 * @returns {String} return.result.countryId The system ID of the default country.
                 */
                function getDefaultCountryAsync() {
                    var DefaultCountryViewId = "679f844a-8cda-4180-83bc-3353d78a5aaf", // DefaultCountry.Mobile.View.xml
                        cacheKey,
                        cacheResult;

                    cacheKey = "dataFormLoad-" + DefaultCountryViewId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(DefaultCountryViewId)
                        .then(function (reply) {
                            var result = {};

                            if (reply && reply.data && reply.data.values) {
                                reply.data.values.forEach(function (dfi) {
                                    switch (dfi.name) {
                                        case "COUNTRYID":
                                            result.countryId = toUpperIdOrNullIfEmpty(dfi.value);
                                            break;
                                    }
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(result));
                            return result;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get format labels for each country
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object} data
                 * @returns {Object[]} return.data.formats
                 * @returns {String} return.data.formats[].id The country's system ID.
                 * @returns {String} return.data.formats[].city The caption to display for city.
                 * @returns {String} return.data.formats[].state The caption to display for state.
                 * @returns {String} return.data.formats[].postCode The caption to display for ZIP/post code.
                 */
                function getCountryFormatsAsync() {
                    var COUNTRYFORMAT_DATALIST_ID = "6fcbb42d-a009-493d-82b2-7b73b85649d2", // CountryFormat.Mobile.DataList
                        cacheKey,
                        cacheResult;

                    cacheKey = "dataListLoad-" + COUNTRYFORMAT_DATALIST_ID;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();
                    return svc.dataListLoad(COUNTRYFORMAT_DATALIST_ID, COUNTRYFORMAT_DATALIST_ID)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                format,
                                formats = [];

                            data = {
                                formats: formats
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                format = reply.data.rows[i].values;

                                data.formats.push({
                                    id: toUpperIdOrNullIfEmpty(format[0]),
                                    city: format[1],
                                    state: format[2],
                                    postCode: format[3]
                                });
                            }
                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        },

                            function (reply) {
                                var error = { message: "" };

                                if (reply && reply.data && reply.data.message) {
                                    error.message = reply.data.message;
                                }
                                return $q.reject(error);

                            });
                }

                return {
                    getPortfolioAsync: getPortfolioAsync,
                    getPortfolioSettingsAsync: getPortfolioSettingsAsync,
                    getConstituentSearchListInformationAsync: getConstituentSearchListInformationAsync,
                    getConstituentSearchResultsAsync: getConstituentSearchResultsAsync,
                    getCountriesListAsync: getCountriesListAsync,
                    getStatesListAsync: getStatesListAsync,
                    getDefaultCountryAsync: getDefaultCountryAsync,
                    getCountryFormatsAsync: getCountryFormatsAsync
                };
            }])

        .factory('searchStorage', function () {
            return {
                showInput: true,
                savedInput: {},
                prospects: []
            };
        })

        .factory("apiProspectView", ["bbuiShellService", "apiCache", "infinityUtilities", "frogResources", "bbui", "$q",
            function (bbuiShellService, apiCache, infinityUtilities, frogResources, bbui, $q) {

                var svc;

                /**
                 * Transforms a collection of phone information to an object that can be used by controllers.
                 * 
                 * @param {Object[]} value
                 * @param {String} value[].name The field ID describing the value.
                 * @param {String} value[].value The value of the field.
                 * 
                 * @returns {Object[]} phones
                 * @returns {String} phones[].number The phone number.
                 * @returns {String} phones[].type The phone type.
                 * @returns {Boolean} phones[].confidential Value indicating whether or not the phone number is confidential.
                 */
                function transformPhones(value) {

                    value = value || [];

                    var phones = [];

                    value.forEach(function (phoneDfi) {
                        var phone = {};
                        phoneDfi.forEach(function (dfi) {
                            switch (dfi.name) {
                                case "PHONENUMBER":
                                    phone.number = dfi.value;
                                    break;
                                case "PHONETYPE":
                                    phone.type = dfi.value;
                                    break;
                                case "ISCONFIDENTIAL":
                                    phone.confidential = dfi.value;
                                    break;
                            }
                        });
                        phones.push(phone);
                    });

                    return phones;

                }

                /**
                 * Transforms a collection of email information to an object that can be used by controllers.
                 * 
                 * @param {Object[]} value
                 * @param {String} value[].name The field ID describing the value.
                 * @param {String} value[].value The value of the field.
                 * 
                 * @returns {Object[]} emails
                 * @returns {String} emails[].address The email address.
                 * @returns {String} emails[].type The email type.
                 */
                function transformEmails(value) {

                    value = value || [];

                    var emails = [];

                    value.forEach(function (emailDfi) {
                        var email = {};
                        emailDfi.forEach(function (dfi) {
                            switch (dfi.name) {
                                case "EMAILADDRESS":
                                    email.address = dfi.value;
                                    break;
                                case "EMAILTYPE":
                                    email.type = dfi.value;
                                    break;
                            }
                        });
                        emails.push(email);
                    });

                    return emails;

                }

                /**
                 * Get basic demographic information on a given prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 * @param {Object} [options]
                 * @param {Boolean} [options.forceReload] Pull the latest information from the database and ignore the cache.
                 *
                 * @returns {Promise<Object>} return
                 *
                 * @returns {String} return.displayName The prospect's display name.
                 * @returns {Boolean} return.deceased Indicates whether or not prospect is deceased.
                 * @returns {Boolean} return.inactive Indicates whether or not prospect is inactive.
                 * @returns {String} return.firstName The prospect's first name.
                 * @returns {String} return.keyName The prospect's last name.
                 * @returns {Boolean} return.hasAddress Indicates or not prospect has an address.
                 * @returns {String} return.pictureThumbnail The prospect's picture thumbnail.
                 *
                 * @returns {Object[]} return.phoneNumbers A collection of the prospect's phone numbers.
                 * @returns {String} return.phoneNumbers.number The phone number.
                 * @returns {String} return.phoneNumbers.type The phone number type.
                 * @returns {Boolean} return.phoneNumbers.confidential Indicates whether or not the phone number is confidential.
                 *
                 * @returns {Object[]} return.emailAddresses A collection of the prospect's email addresses.
                 * @returns {String} return.emailAddresses.address The email address.
                 * @returns {String} return.emailAddresses.type The email address type.
                 *
                 * @returns {String} return.jobTitle The prospect's job title.
                 * @returns {String} return.primaryBusinessId The system ID of the prospect's primary business.
                 * @returns {String} return.primaryBusinessName The primary business' name.
                 *
                 * @returns {String} return.spouseId The system ID of the prospect's spouse.
                 * @returns {String} return.spouseName The spouse's name.
                 * @returns {Boolean} return.spouseDeceased Indicates whether or not the spouse is deceased.
                 *
                 * @returns {String} return.nextStepId The system ID of the next step for the prospect.
                 * @returns {String} return.nextStepContactMethodId The system ID of the contact method of the next step for the prospect.
                 * @returns {String} return.nextStepContactMethod The contact method of the next step for the prospect.
                 * @returns {String} return.nextStepObjective The objective of the next step for the prospect.
                 * @returns {String} return.nextStepComments The comments on the next step for the prospect.
                 * @returns {String} return.nextStepLocation The location of the next step for the prospect.
                 * @returns {String} return.nextStepDate The date of the next step for the prospect. Format "yyyy-MM-ddT00:00:00". Time info should be ignored.
                 * @returns {String} return.nextStepTime The time of the next step for the prospect.
                 * @returns {String} return.nextStepPlanId The system ID of the prospect plan associated with the next step for the prospect.
                 * @returns {String} return.nextStepPlanName The name of the prospect plan associated with the next step for the prospect.
                 *
                 * @returns {String} return.prospectManagerId The system ID of the prospect manager.
                 * @returns {String} return.prospectManagerName The name of the prospect manager.
                 *
                 * @returns {String} return.primaryMemberId The system ID of the primary group member.
                 * @returns {String} return.primaryMemberName The name of the primary group member.
                 *
                 * @returns {String} return.prospectFullName The prospect's formatted full name.
                 */
                function getProspectInfoAsync(prospectId, options) {
                    var ProspectViewId = "b0ba1b14-97f7-46d3-b211-ebfa3a783909", // Prospect.Mobile.View.xml
                        cacheKey,
                        cacheResult;

                    options = cloneOrNew(bbui, options);

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({
                            message: ProspectIdRequiredMessage
                        });
                    }

                    prospectId = prospectId.toUpperCase();

                    if (!options.forceReload) {
                        cacheKey = "dataFormLoad-" + ProspectViewId + "-" + prospectId;
                        cacheResult = apiCache.cache.get(cacheKey);

                        if (cacheResult) {
                            return $q.resolve(cacheResult);
                        }
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(
                        ProspectViewId,
                        {
                            recordId: prospectId
                        }
                    ).then(function (reply) {
                        var result = {},
                            spouseFirstName,
                            spouseLastName,
                            spouseFullName,
                            primaryMemberFirstName,
                            primaryMemberKeyName,
                            primaryMemberFullName,
                            prospectManagerFirstName,
                            prospectManagerKeyName,
                            prospectManagerFullName;

                        if (reply && reply.data && reply.data.values) {
                            reply.data.values.forEach(function (dfi) {
                                switch (dfi.name) {
                                    case "DISPLAYNAME":
                                        result.displayName = dfi.value;
                                        break;
                                    case "DECEASED":
                                        result.deceased = dfi.value;
                                        break;
                                    case "ISINACTIVE":
                                        result.inactive = dfi.value;
                                        break;
                                    case "FIRSTNAME":
                                        result.firstName = dfi.value;
                                        break;
                                    case "KEYNAME":
                                        result.keyName = dfi.value;
                                        break;
                                    case "HASADDRESS":
                                        result.hasAddress = dfi.value;
                                        break;
                                    case "PICTURETHUMBNAIL":
                                        result.pictureThumbnail = dfi.value;
                                        break;
                                    case "PHONENUMBERS":
                                        result.phoneNumbers = transformPhones(dfi.value);
                                        break;
                                    case "EMAILADDRESSES":
                                        result.emailAddresses = transformEmails(dfi.value);
                                        break;
                                    case "JOBTITLE":
                                        result.jobTitle = dfi.value;
                                        break;
                                    case "PRIMARYBUSINESSID":
                                        result.primaryBusinessId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "PRIMARYBUSINESSNAME":
                                        result.primaryBusinessName = dfi.value;
                                        break;
                                    case "PROSPECTMANAGERFIRSTNAME":
                                        prospectManagerFirstName = dfi.value;
                                        break;
                                    case "PROSPECTMANAGERKEYNAME":
                                        prospectManagerKeyName = dfi.value;
                                        break;
                                    case "PROSPECTMANAGERID":
                                        result.prospectManagerId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "PRIMARYMEMBERID":
                                        result.primaryMemberId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "PRIMARYMEMBERFIRSTNAME":
                                        primaryMemberFirstName = dfi.value;
                                        break;
                                    case "PRIMARYMEMBERKEYNAME":
                                        primaryMemberKeyName = dfi.value;
                                        break;
                                    case "SPOUSEID":
                                        result.spouseId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "SPOUSEFIRSTNAME":
                                        spouseFirstName = dfi.value;
                                        break;
                                    case "SPOUSELASTNAME":
                                        spouseLastName = dfi.value;
                                        break;
                                    case "SPOUSEDECEASED":
                                        result.spouseDeceased = dfi.value;
                                        break;
                                    case "NEXTSTEPPLANID":
                                        result.nextStepPlanId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "NEXTSTEPPLANNAME":
                                        result.nextStepPlanName = dfi.value;
                                        break;
                                    case "NEXTSTEPCONTACTMETHODID":
                                        result.nextStepContactMethodId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "NEXTSTEPCONTACTMETHOD":
                                        result.nextStepContactMethod = dfi.value;
                                        break;
                                    case "NEXTSTEPOBJECTIVE":
                                        result.nextStepObjective = dfi.value;
                                        break;
                                    case "NEXTSTEPLOCATION":
                                        result.nextStepLocation = dfi.value;
                                        break;
                                    case "NEXTSTEPDATE":
                                        result.nextStepDate = dfi.value;
                                        break;
                                    case "NEXTSTEPTIME":
                                        result.nextStepTime = infinityUtilities.convertHourMinute(dfi.value);
                                        break;
                                    case "NEXTSTEPID":
                                        result.nextStepId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "NEXTSTEPCOMMENTS":
                                        result.nextStepComments = dfi.value;
                                        break;
                                }
                            });

                            spouseFullName = getFullName(frogResources, spouseFirstName, spouseLastName);
                            primaryMemberFullName = getFullName(frogResources, primaryMemberFirstName, primaryMemberKeyName);
                            prospectManagerFullName = getFullName(frogResources, prospectManagerFirstName, prospectManagerKeyName);
                            result.prospectFullName = getFullName(frogResources, result.firstName, result.keyName);

                            if (spouseFullName) {
                                result.spouseName = spouseFullName;
                            }

                            if (primaryMemberFullName) {
                                result.primaryMemberName = primaryMemberFullName;
                            }

                            if (prospectManagerFullName) {
                                result.prospectManagerName = prospectManagerFullName;
                            }
                        }

                        apiCache.cache.put(cacheKey, bbui.clone(result));
                        return result;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get smart field summary information on a prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.summaryInformation
                 * @returns {String} return.summaryInformation.smartFieldName The name of the smart field.
                 * @returns {String} return.summaryInformation.smartFieldValue The value of the smart field, formatted based on currency and locale.
                 * @returns {String} return.summaryInformation.currencyId The system ID of the currency.
                 * @returns {String} return.summaryInformation.currencySymbol The currency symbol.
                 * @returns {String} return.summaryInformation.decimalSeparator The decimal separator, based on locale.
                 * @returns {String} return.summaryInformation.groupSeparator The group separator, based on locale.
                 */
                function getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                    var ProspectSummaryDataListId = "2be9ef80-1880-41ed-9b30-9b953183b43e",
                        cacheKey,
                        cacheResult;

                    successCallback = successCallback || noop;
                    finallyCallback = finallyCallback || noop;

                    if (!prospectId || typeof prospectId !== "string") {

                        if (failureCallback) {
                            failureCallback({
                                message: ProspectIdRequiredMessage
                            });

                            finallyCallback();

                            return;
                        }

                        throw new Error(ProspectIdRequiredMessage);
                    }

                    failureCallback = failureCallback || noop;

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + ProspectSummaryDataListId + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        successCallback(cacheResult);
                        finallyCallback();
                    } else {
                        svc = bbuiShellService.create();

                        svc.dataListLoad(
                            ProspectSummaryDataListId,
                            prospectId
                        )
                            .then(function (reply) {
                                var data,
                                    i,
                                    n,
                                    info,
                                    amount;

                                data = {
                                    summaryInformation: []
                                };

                                for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                    info = reply.data.rows[i].values;
                                    amount = (info[1]) ? parseFloat(info[1]) : null;

                                    data.summaryInformation.push({
                                        smartFieldName: info[0],
                                        smartFieldValue: amount,
                                        bbAutonumericConfig: {
                                            aSign: info[3],
                                            aDec: info[4],
                                            aSep: info[5],
                                            // This trick determines if you have a whole number, and if so, don't include decimal padding.
                                            aPad: amount % 1 !== 0
                                        }
                                        // TODO: decimal digits and rounding type?
                                        // autonumeric doesn't look to support Infinity Currency rounding options
                                    });
                                }

                                apiCache.cache.put(cacheKey, bbui.clone(data));
                                successCallback(data);
                            })
                            .catch(function (reply) {
                                requestFailure(reply, failureCallback);
                            })
                            .finally(finallyCallback);
                    }
                }

                /**
                 * Get the recent steps and interactions for a prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 * 
                 * @param {Object} options
                 * @param {Object[]} options.parameters A collection of parameters.
                 * @param {String} options.parameters.id The FieldId of the parameter to be used to load the data list.
                 * @param {Object} options.parameters.value The value of the parameter.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.steps
                 * @returns {String} return.steps.id The system ID for the step or interaction.
                 * @returns {String} return.steps.contactMethod The contact method on the step or interaction.
                 * @returns {String} return.steps.objective The objective of the step or interaction.
                 * @returns {String} return.steps.date The date on the step or interaction.
                 * @returns {String} return.steps.comments The comments on the step or interaction.
                 * @returns {String} return.steps.planName The name of the prospect plan associated with the step or interaction.
                 * @returns {String} return.steps.planId The system ID of the prospect plan associated with the step or interaction.
                 */
                function getRecentStepsAsync(prospectId, options) {
                    var RECENTSTEPS_DATALIST_ID = "580e374a-3d5f-4218-9d39-5d2356e04b42";  // RecentSteps.Mobile.DataList.xml

                    options = cloneOrNew(bbui, options);

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({ message: ProspectIdRequiredMessage });
                    }

                    prospectId = prospectId.toUpperCase();

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        RECENTSTEPS_DATALIST_ID,
                        prospectId,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                steps = [];

                            data = {
                                steps: steps
                            };

                            angular.forEach(reply.data.rows, function (row) {
                                var step = row.values;

                                steps.push({
                                    id: step[0].toUpperCase(),
                                    contactMethod: step[1],
                                    objective: step[2],
                                    date: step[3],
                                    comments: step[4],
                                    planName: step[5],
                                    planId: toUpperIdOrNullIfEmpty(step[6])
                                });
                            });

                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get the recent gifts and credits for a prospect.
                 *
                 * @param {String} prospectId
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.gifts
                 * @returns {String} return.data.gifts.id The system ID of the gift.
                 * @returns {Number} return.data.gifts.amount The gift amount, formatted by currency and locale.
                 * @returns {String} return.data.gifts.applicationType The application type of the gift.
                 * @returns {String} return.data.gifts.date The transaction date of the gift.
                 * @returns {String} return.data.gifts.designation The designation associated with the gift.
                 * @returns {Boolean} return.data.gifts.isRecognitionCredit Indicates whether or not the gift is a recognition credit.
                 * @returns {String} return.data.gifts.recognitionCreditType The recognition credit type.
                 * 
                 * @returns {Object} return.data.gifts.bbAutonumericConfig
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aSign The currency symbol.
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aDec The decimal separator, determined by locale.
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aSep The group separator, determined by locale.
                 * @returns {Boolean} return.data.gifts.bbAutonumericConfig.aPad Indicates whether to pad for decimal values.
                 */
                function getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                    var RecentGiftsAndCreditsDataListId = "85943cb8-8aae-4b27-b71a-31ba13942648",
                        cacheKey,
                        cacheResult;

                    successCallback = successCallback || noop;
                    finallyCallback = finallyCallback || noop;

                    if (!prospectId || typeof prospectId !== "string") {

                        if (failureCallback) {
                            failureCallback({
                                message: ProspectIdRequiredMessage
                            });

                            finallyCallback();

                            return;
                        }

                        throw new Error(ProspectIdRequiredMessage);

                    }

                    failureCallback = failureCallback || noop;

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + RecentGiftsAndCreditsDataListId + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        successCallback(cacheResult);
                        finallyCallback();
                    } else {
                        svc = bbuiShellService.create();

                        svc.dataListLoad(
                            RecentGiftsAndCreditsDataListId,
                            prospectId
                        )
                            .then(function (reply) {
                                var data,
                                    i,
                                    n,
                                    gift,
                                    amount;

                                data = {
                                    gifts: []
                                };

                                for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                    gift = reply.data.rows[i].values;
                                    amount = parseFloat(gift[1]);

                                    data.gifts.push({
                                        id: gift[0].toUpperCase(),
                                        amount: amount,
                                        applicationType: gift[3],
                                        date: gift[4],
                                        designation: gift[5],
                                        isRecognitionCredit: (gift[6] === "0") ? false : true,
                                        recognitionCreditType: gift[7],
                                        bbAutonumericConfig: {
                                            aSign: gift[8],
                                            aDec: gift[9],
                                            aSep: gift[10],
                                            // This trick determines if you have a whole number, and if so, don't include decimal padding.
                                            aPad: amount % 1 !== 0
                                        }
                                        // TODO: decimal digits and rounding type?
                                        // autonumeric doesn't look to support Infinity Currency rounding options
                                    });
                                }

                                apiCache.cache.put(cacheKey, bbui.clone(data));
                                successCallback(data);
                            })
                            .catch(function (reply) {
                                requestFailure(reply, failureCallback);
                            })
                            .finally(finallyCallback);
                    }
                }

                /**
                 * Get a list of addresses for the given prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.addresses
                 * @returns {String} return.data.addresses.addressType The type of the address.
                 * @returns {Boolean} return.data.addresses.isPrimary Indicates whether the address is primary.
                 * @returns {Boolean} return.data.addresses.isConfidential Indicates whether the address is confidential.
                 * @returns {Boolean} return.data.addresses.doNotMail Indicates whether the address is marked as do not mail.
                 * @returns {String} return.data.addresses.description The description of the address.
                 * @returns {String} return.data.addresses.startDate The start date of the address.
                 * @returns {String} return.data.addresses.endDate The end date of the address.
                 * @returns {Boolean} return.data.addresses.isSeasonal Indicates whether the address is seasonal.
                 */
                function getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                    var AddressesDataList = "45fd795a-bfbb-493c-9268-f88c153b66b9",
                        cacheKey,
                        cacheResult;

                    successCallback = successCallback || noop;
                    finallyCallback = finallyCallback || noop;

                    if (!prospectId || typeof prospectId !== "string") {

                        if (failureCallback) {
                            failureCallback({
                                message: ProspectIdRequiredMessage
                            });

                            finallyCallback();

                            return;
                        }

                        throw new Error(ProspectIdRequiredMessage);

                    }

                    failureCallback = failureCallback || noop;

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + AddressesDataList + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        successCallback(cacheResult);
                        finallyCallback();
                    } else {
                        svc = bbuiShellService.create();

                        svc.dataListLoad(
                            AddressesDataList,
                            prospectId
                        )
                            .then(function (reply) {
                                var data,
                                    i,
                                    n,
                                    address;

                                data = {
                                    addresses: []
                                };

                                for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                    address = reply.data.rows[i].values;

                                    data.addresses.push({
                                        addressType: (address[0]) ? address[0] : frogResources.unknown,
                                        isPrimary: (address[1] === "0") ? false : true,
                                        isConfidential: (address[2] === "0") ? false : true,
                                        doNotMail: (address[3] === "0") ? false : true,
                                        description: address[4],
                                        startDate: address[5],
                                        endDate: address[6],
                                        isSeasonal: (address[7] === "0") ? false : true
                                    });
                                }

                                apiCache.cache.put(cacheKey, bbui.clone(data));
                                successCallback(data);
                            })
                            .catch(function (reply) {
                                requestFailure(reply, failureCallback);
                            })
                            .finally(finallyCallback);
                    }
                }

                /**
                 * Get additional details for a given financial transaction line item.
                 *
                 * @param {String} lineItemId The system ID of the given line item.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {String} return.currencyId The system ID of the associated currency.
                 * @returns {String} return.campaigns A list of associated campaigns.
                 * @returns {String} return.revenueCategory The associated revenue category.
                 * @returns {String} return.solicitors A list of associated solicitors.
                 * @returns {String} return.recognitions A list of revenue recognitions.
                 * @returns {String} return.opportunity The associated opportunity.
                 * @returns {String} return.appliedTo The application to which the line item is applied.
                 * @returns {String} return.giftAidStatus The gift aid status of the line item. (UK)
                 * @returns {String} return.taxClaimEligibility The tax claim eligibility of the line item. (UK)
                 * @returns {String} return.taxClaimAmount The tax claim amount of the line item. (UK)
                 */
                function getAdditionalRevenueDetailsAsync(lineItemId) {
                    var RevenueDetailsViewId = "aa822383-f32f-4916-95bd-0f4b9a89e4b3", // RevenueDetails.Mobile.View.xml
                        cacheKey,
                        cacheResult;

                    if (!lineItemId || typeof lineItemId !== "string") {
                        return $q.reject({
                            message: "lineItemId is required"
                        });
                    }

                    lineItemId = lineItemId.toUpperCase();

                    cacheKey = "dataFormLoad-" + RevenueDetailsViewId + "-" + lineItemId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(
                        RevenueDetailsViewId,
                        {
                            recordId: lineItemId
                        }
                    ).then(function (reply) {
                        var result = {};

                        if (reply && reply.data && reply.data.values) {
                            reply.data.values.forEach(function (dfi) {
                                switch (dfi.name) {
                                    case "CURRENCYID":
                                        result.currencyId = toUpperIdOrNullIfEmpty(dfi.value);
                                        break;
                                    case "CAMPAIGNS":
                                        result.campaigns = dfi.value;
                                        break;
                                    case "REVENUECATEGORY":
                                        result.revenueCategory = dfi.value;
                                        break;
                                    case "SOLICITORSLIST":
                                        result.solicitors = dfi.value;
                                        break;
                                    case "RECOGNITIONSLIST":
                                        result.recognitions = dfi.value;
                                        break;
                                    case "OPPORTUNITY":
                                        result.opportunity = dfi.value;
                                        break;
                                    case "APPLIEDTO":
                                        result.appliedTo = dfi.value;
                                        break;
                                    case "GIFTAIDSTATUS":
                                        result.giftAidStatus = dfi.value;
                                        break;
                                    case "TAXCLAIMELIGIBILITY":
                                        result.taxClaimEligibility = dfi.value;
                                        break;
                                    case "TAXCLAIMAMOUNT":
                                        result.taxClaimAmount = dfi.value;
                                        break;
                                }
                            });
                        }

                        apiCache.cache.put(cacheKey, bbui.clone(result));
                        return result;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                return {
                    getProspectInfoAsync: getProspectInfoAsync,
                    getProspectSummaryAsync: getProspectSummaryAsync,
                    getRecentStepsAsync: getRecentStepsAsync,
                    getRecentGiftsAndCreditsAsync: getRecentGiftsAndCreditsAsync,
                    getAddressesListAsync: getAddressesListAsync,
                    getAdditionalRevenueDetailsAsync: getAdditionalRevenueDetailsAsync
                };
            }])

        .factory("apiContactReportOptions", ["bbuiShellService", "apiCache", "bbui", "prospectUtilities", "$q", "frogResources",
            function (bbuiShellService, apiCache, bbui, prospectUtilities, $q, frogResources) {

                var svc,
                    CONTACTMETHOD_SIMPLELIST_ID = "a89a4f2b-76f2-43fa-8abc-ae0e84d2d64e", // ContactMethods.Mobile.SimpleList.xml
                    INTERACTIONCATEGORIES_SIMPLELIST_ID = "CBBA7545-B66F-44AC-AA24-D9C2F8CBC4EC", // InteractionCategory.SimpleList.xml
                    SUBCATEGORIES_SIMPLELIST_ID = "0EACC39B-07D1-4641-8774-E319559535A7", // InteractionSubcategory.SimpleList.xml
                    POTENTIALSOLICITORS_SIMPLELIST_ID = "8A1DE7E9-57B4-400F-ABAB-1F0F7B96B02D", // ProspectPlanFundraisers.Mobile.SimpleList.xml
                    SITES_SIMPLELIST_ID = "C8E8D3BA-2725-421f-A796-E2FCC1202780"; // SitesForUser.SimpleList.xml

                /**
                 * Get a list of contact methods to use on the Contact Report.
                 * 
                 * @param {Object} options
                 * @param {String} options.securityContextFeatureId The feature ID providing implied security for the contact method simple data list.
                 * @param {String} options.securityContextFeatureType The feature type of the feature providing implied security of the contact method simple data list.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.contactMethods
                 * @returns {String} return.contactMethods.id The system ID of the contact method.
                 * @returns {String} return.contactMethods.name The name of the contact method.
                 */
                function getContactMethodsAsync(options) {
                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + CONTACTMETHOD_SIMPLELIST_ID;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        CONTACTMETHOD_SIMPLELIST_ID,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                contactMethod,
                                contactMethods = [];

                            data = {
                                contactMethods: contactMethods
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                contactMethod = reply.data.rows[i];

                                contactMethods.push({
                                    id: contactMethod.value.toUpperCase(),
                                    name: contactMethod.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of plan stages to use on the Contact Report.
                 *
                 * @param {Object} options]
                 * @param {String} options.securityContextFeatureId The feature ID providing implied security for the prospect plan stages simple data list.
                 * @param {String} options.securityContextFeatureType The feature type of the feature providing implied security of the prospect plan stages simple data list.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.planStages
                 * @returns {String} return.planStages.id The system ID of the plan stage.
                 * @returns {String} return.planStages.name The name of the plan stage.
                 */
                function getPlanStagesAsync(options) {
                    var cacheKey,
                        cacheResult,
                        ProspectPlanStagesSimpleDataListId = "48182a32-39ee-454e-87e8-ac6ae255c259";

                    cacheKey = "simpleDataListLoad-" + ProspectPlanStagesSimpleDataListId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        ProspectPlanStagesSimpleDataListId,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                planStage,
                                planStages = [];

                            data = {
                                planStages: planStages
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                planStage = reply.data.rows[i];

                                planStages.push({
                                    id: planStage.value.toUpperCase(),
                                    name: planStage.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of categories to use on the Contact report.
                 *
                 * @param {frog.util.prospectUtilities.PlanType} planType The prospect/stewardship plan type.
                 *
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId] The feature ID providing implied security for the interaction categories simple data list.
                 * @param {String} [options.securityContextFeatureType] The feature type of the feature providing implied security of the interaction categories simple data list.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.categories
                 * @returns {String} return.categories.id The system ID of the category.
                 * @returns {String} return.categories.name The name of the category.
                 */
                function getCategoriesAsync(planType, options) {
                    var cacheKey,
                        cacheResult,
                        CodeTableEntryMobileSimpleDataListId = "4BC0FBBF-F1FD-465D-9B40-FCD3B4E5A335",
                        StewardshipStepCategoryCode = "STEWARDSHIPSTEPCATEGORYCODE",
                        simpleListId;

                    if (planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP) {
                        simpleListId = CodeTableEntryMobileSimpleDataListId;
                        cacheKey = "simpleDataListLoad-" + CodeTableEntryMobileSimpleDataListId + "-" + StewardshipStepCategoryCode;
                        options = cloneOrNew(bbui, options);

                        angular.extend(options, {
                            parameters: [{
                                id: "CODETABLENAME",
                                value: StewardshipStepCategoryCode
                            }]
                        });

                    } else {
                        simpleListId = INTERACTIONCATEGORIES_SIMPLELIST_ID;
                        // Prospect plan steps and interactions have the same categories.
                        cacheKey = "simpleDataListLoad-" + INTERACTIONCATEGORIES_SIMPLELIST_ID;
                    }

                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(simpleListId, options)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                category,
                                categories = [];

                            data = {
                                categories: categories
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                category = reply.data.rows[i];

                                categories.push({
                                    id: category.value.toUpperCase(),
                                    name: category.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of locations associated with a given prospect to use on the Contact Report.
                 *
                 * @param {String} prospectId The system ID of the prospect.
                 *
                 * @param {Object} options
                 * @param {String} options.securityContextFeatureId The feature ID providing implied security for the address simple data list.
                 * @param {String} options.securityContextFeatureType The feature type of the feature providing implied security of the address simple data list.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.locations
                 * @returns {String} return.locations.id The system ID of the location.
                 * @returns {String} return.locations.name The name of the location.
                 */
                function getLocationsAsync(prospectId, options) {
                    var cacheKey,
                        cacheResult,
                        LocationSimpleDataListId = "b0cb4058-4355-431a-abdb-3e9f2be8c918";

                    cacheKey = "simpleDataListLoad-" + LocationSimpleDataListId + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "CONSTITUENTID",
                                value: prospectId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(LocationSimpleDataListId, options)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                location,
                                locations = [];

                            data = {
                                locations: locations
                            };

                            // Fetch existing addresses from database
                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                location = reply.data.rows[i];

                                locations.push({
                                    id: location.value.toUpperCase(),
                                    name: location.label
                                });
                            }

                            // Add "other" option using its well-known GUID
                            locations.push({
                                id: "84A394FE-55B8-4737-9B2F-CC478766EC39",
                                name: frogResources.other
                            });

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of subcategories to use on the Contact report.
                 *
                 * @param {String} categoryId The system ID of the category to use to find subcategories.
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId] The feature ID providing implied security for the interaction subcategories simple data list.
                 * @param {String} [options.securityContextFeatureType] The feature type of the feature providing implied security of the interaction subcategories simple data list.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.subcategories
                 * @returns {String} return.subcategories.id The system ID of the subcategory.
                 * @returns {String} return.subcategories.name The name of the subcategory.
                 */
                function getSubcategoriesAsync(categoryId, options) {
                    if (!categoryId || typeof categoryId !== "string") {
                        return $q.reject({ message: "categoryId is required" });
                    }

                    categoryId = categoryId.toUpperCase();

                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + SUBCATEGORIES_SIMPLELIST_ID + "-" + categoryId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "INTERACTIONCATEGORYID",
                                value: categoryId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        SUBCATEGORIES_SIMPLELIST_ID,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                subcategory,
                                subcategories = [];

                            data = {
                                subcategories: subcategories
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                subcategory = reply.data.rows[i];

                                subcategories.push({
                                    id: subcategory.value.toUpperCase(),
                                    name: subcategory.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of step participants for a prospect.
                 *
                 * @param {String} prospectId The system ID of the prospect.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.potentialParticipants
                 * @returns {String} return.potentialParticipants.id The system ID of the potential participant.
                 * @returns {String} return.potentialParticipants.name The name of the potential participant.
                 */
                function getPotentialParticipantsAsync(prospectId) {
                    var InteractionParticipantCandidatesMobileDataListId = "21c66a32-5acd-4329-aa8e-9e3b0f6d2e9b",
                        cacheKey,
                        cacheResult;

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({ message: ProspectIdRequiredMessage });
                    }

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + InteractionParticipantCandidatesMobileDataListId + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        InteractionParticipantCandidatesMobileDataListId,
                        prospectId
                    )
                        .then(function (reply) {
                            var data,
                                participants = [];

                            data = {
                                potentialParticipants: participants
                            };

                            reply.data.rows.forEach(function (participant) {
                                var participantValues = participant.values;

                                participants.push({
                                    id: participantValues[0].toUpperCase(),
                                    name: getFullName(frogResources, participantValues[1], participantValues[2])
                                });
                            });

                            apiCache.cache.put(cacheKey, bbui.clone(data));

                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of step additional solicitors for a prospect.
                 *
                 * @param {String} planId The system ID of the prospect/stewardship plan.
                 *
                 * @param {Object} options
                 * @param {String} options.securityContextFeatureId The feature ID providing implied security for the potential solicitors simple data list.
                 * @param {String} options.securityContextFeatureType The feature type of the feature providing implied security of the potential solicitors simple data list.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.potentialSolicitors
                 * @returns {String} return.potentialSolicitors.id The system ID of the solicitor.
                 * @returns {String} return.potentialSolicitors.name The name of the solicitor.
                 */
                function getPotentialSolicitorsAsync(planId, options) {

                    if (!planId || typeof planId !== "string") {
                        return $q.reject({ message: "planId is required" });
                    }

                    planId = planId.toUpperCase();

                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + POTENTIALSOLICITORS_SIMPLELIST_ID + "-" + planId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "PROSPECTPLANID",
                                value: planId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        POTENTIALSOLICITORS_SIMPLELIST_ID,
                        options
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                solicitor,
                                solicitors = [];

                            data = {
                                potentialSolicitors: solicitors
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                solicitor = reply.data.rows[i];

                                solicitors.push({
                                    id: solicitor.value.toUpperCase(),
                                    name: solicitor.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of sites.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Array} return.sites
                 * @returns {String} return.sites.id The system ID of the site.
                 * @returns {String} return.sites.name The name of the site.
                 */
                function getSitesAsync() {
                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + SITES_SIMPLELIST_ID;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(SITES_SIMPLELIST_ID)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                site,
                                sites = [];

                            data = {
                                sites: sites
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                site = reply.data.rows[i];
                                sites.push({
                                    id: site.value.toUpperCase(),
                                    name: site.label
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get a list of plans for a prospect.
                 *
                 * @param {String} prospectId The system ID of the prospect.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.plans
                 * @returns {String} return.plans.id The system ID of the plan.
                 * @returns {String} return.plans.name The name of the plan.
                 * @returns {String} return.plans.planType The type of the plan.
                 */
                function getPlansAsync(prospectId) {
                    var ProspectPlansMobileDataListId = "2696ec4c-34df-4922-b0ac-4b57acc14e28",
                        cacheKey,
                        cacheResult;

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({
                            message: ProspectIdRequiredMessage
                        });
                    }

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + ProspectPlansMobileDataListId + "-" + prospectId;
                    cacheResult = apiCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        ProspectPlansMobileDataListId,
                        prospectId
                    )
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                plan,
                                plans = [];

                            data = {
                                plans: plans
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                plan = reply.data.rows[i].values;

                                plans.push({
                                    id: plan[0].toUpperCase(),
                                    name: plan[1],
                                    planType: parseInt(plan[2]) + 1
                                });
                            }

                            apiCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get the status codes available for plan steps.
                 *
                 * This is purposefully hard-coded and we do not need to get this information from CRM. This is a ValueList in the spec.
                 *
                 * Making this async so that if there are other products that use this in the future, if they need to grab the possible status codes from their back end, that is simple to do.
                 *
                 * @param {frog.util.prospectUtilities.PlanType} planType
                 *
                 * @returns {Promise<Object[]>} return
                 * @returns {String} return.value The enumeration value for the status code.
                 * @returns {String} return.label The description of the status code.
                 */
                function getStatusCodesAsync(planType) {
                    var statusCodes = [
                        {
                            value: 1,
                            label: frogResources.pending
                        },
                        {
                            value: 2,
                            label: frogResources.completed
                        }
                    ];

                    switch (planType) {
                        case prospectUtilities.PLAN_TYPE.PROSPECT:
                            // Insert the status at the beginning.
                            statusCodes.unshift({
                                value: 0,
                                label: frogResources.planned
                            });
                            break;
                        case prospectUtilities.PLAN_TYPE.STEWARDSHIP:
                            statusCodes = [
                                {
                                    value: 0,
                                    label: frogResources.pending
                                },
                                {
                                    value: 1,
                                    label: frogResources.completed
                                }
                            ];
                            break;
                    }

                    return $q.resolve({
                        statusCodes: statusCodes
                    });
                }

                return {
                    getContactMethodsAsync: getContactMethodsAsync,
                    getPlanStagesAsync: getPlanStagesAsync,
                    getCategoriesAsync: getCategoriesAsync,
                    getSubcategoriesAsync: getSubcategoriesAsync,
                    getLocationsAsync: getLocationsAsync,
                    getPotentialParticipantsAsync: getPotentialParticipantsAsync,
                    getPotentialSolicitorsAsync: getPotentialSolicitorsAsync,
                    getSitesAsync: getSitesAsync,
                    getPlansAsync: getPlansAsync,
                    getStatusCodesAsync: getStatusCodesAsync
                };

            }])

        .factory("apiContactReport", ["bbuiShellService", "prospectUtilities", "$rootScope", "$q", "frogResources", function (bbuiShellService, prospectUtilities, $rootScope, $q, frogResources) {
            var svc,
                StepAddId = "8eab8484-8188-4e63-a514-e08bea349a05",
                StepEditId = "28ae3c5b-a40a-4bd2-ba3a-504f8ab010c8",
                ConstituentIdFieldName = "CONSTITUENTID",
                FundraiserIdFieldName = "FUNDRAISERID",
                ProspectPlanIdFieldName = "PROSPECTPLANID",
                StewardshipPlanIdFieldName = "STEWARDSHIPPLANID",
                InteractionTypeCodeIdFieldName = "INTERACTIONTYPECODEID",
                ObjectiveFieldName = "OBJECTIVE",
                DateFieldName = "DATE",
                StatusCodeFieldName = "STATUSCODE",
                CommentFieldName = "COMMENT",
                ParticipantsFieldName = "PARTICIPANTS",
                InteractionCategoryIdFieldName = "INTERACTIONCATEGORYID",
                InteractionSubcategoryIdFieldName = "INTERACTIONSUBCATEGORYID",
                LocationFieldName = "LOCATION",
                LocationIdFieldName = "LOCATIONID",
                OtherLocationFieldName = "OTHERLOCATION",
                StewardshipCategoryIdFieldName = "STEWARDSHIPCATEGORYID",
                ProspectPlanStatusCodeIdFieldName = "PROSPECTPLANSTATUSCODEID",
                AdditionalSolicitorsFieldName = "ADDITIONALSOLICITORS",
                SiteIdFieldName = "SITEID",
                SiteRequiredFieldName = "SITEREQUIRED",
                PlanTypeFieldName = "PLANTYPE",
                FirstNameFieldName = "FIRSTNAME",
                KeyNameFieldName = "KEYNAME";

            return {
                addStepAsync: addStepAsync,
                editStepAsync: editStepAsync,
                loadStepAsync: loadStepAsync,
                getContactReportPreloadAsync: getContactReportPreloadAsync
            };

            /**
             * Transform a list of participants into a standard list that controllers can use.
             * 
             * @param {Object[]} participants
             * @param {String} participants.constituentId The system ID of the participant.
             * 
             * @returns {Object[]} transformedParticipants
             * @returns {String} transformedParticipants.name The FieldId to use. Hard-coded to "CONSTITUENTID."
             * @returns {String} transformedParticipants.value The system ID of the particpant.
             */
            function getTransformedParticipants(participants) {
                var transformedParticipants = [];

                if (participants) {
                    participants.forEach(function (participant) {
                        transformedParticipants.push([
                            {
                                name: ConstituentIdFieldName,
                                value: participant.constituentId
                            }
                        ]);
                    });
                }

                return transformedParticipants;
            }

            /**
             * Transform a list of solicitors into a standard list that controllers can use.
             * 
             * @param {Object[]} solicitors
             * @param {String} solicitors.constituentId The system ID of the solicitor.
             * 
             * @returns {Object[]} transformedSolicitors
             * @returns {String} transformedSolicitors.name The FieldId to use. Hard-coded to "FUNDRAISERID."
             * @returns {String} transformedSolicitors.value The system ID of the solicitor.
             */
            function getTransformedSolicitors(solicitors) {
                var transformedSolicitors = [];

                if (solicitors) {
                    solicitors.forEach(function (solicitor) {
                        transformedSolicitors.push([
                            {
                                name: FundraiserIdFieldName,
                                value: solicitor.constituentId
                            }
                        ]);
                    });
                }

                return transformedSolicitors;
            }

            /**
             * Add a step to a prospect/stewardship plan.
             *
             * @param {Object} step
             * @param {String} step.prospectId The system ID of the prospect.
             * @param {String} step.contactMethodId The system ID for the contact method to be used.
             * @param {String} step.objective The step's objective.
             * @param {Date} step.date The step's date.
             * @param {Number} step.statusCode The step's status code.
             * @param {String} step.comments The comments on the step.
             * @param {Object[]} step.participants
             * @param {String} step.participants.constituentId The system ID of the participant.
             * @param {String} step.categoryId The category of the step.
             * @param {String} step.subcategoryId The subcategory of the step.
             * @param {String} step.planStageId The system ID for the plan stage.
             * @param {Object[]} step.solicitors
             * @param {String} step.solicitors.constituentId The system ID of the solicitor.
             * @param {String} step.planId The system ID to which to add the step.
             * @param {frog.utils.prospectUtilities.PlanType} step.planType The plan type.
             * @param {String} step.siteId The system ID for the step's site.
             * 
             * @returns {Promise<String>} The ID of the step saved.
             */
            function addStepAsync(step) {
                step = step || {};
                svc = bbuiShellService.create();

                return svc.dataFormSave(
                    StepAddId,
                    {
                        values: [
                            {
                                name: ConstituentIdFieldName,
                                value: step.prospectId
                            },
                            {
                                name: ProspectPlanIdFieldName,
                                value: step.planType === prospectUtilities.PLAN_TYPE.PROSPECT ? step.planId : null
                            },
                            {
                                name: StewardshipPlanIdFieldName,
                                value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.planId : null
                            },
                            {
                                name: InteractionTypeCodeIdFieldName,
                                value: step.contactMethodId
                            },
                            {
                                name: ObjectiveFieldName,
                                value: step.objective
                            },
                            {
                                name: DateFieldName,
                                value: step.date
                            },
                            {
                                name: StatusCodeFieldName,
                                value: step.statusCode
                            },
                            {
                                name: CommentFieldName,
                                value: step.comments
                            },
                            {
                                name: ParticipantsFieldName,
                                collectionValue: getTransformedParticipants(step.participants)
                            },
                            {
                                name: InteractionCategoryIdFieldName,
                                value: step.planType !== prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                            },
                            {
                                name: InteractionSubcategoryIdFieldName,
                                value: step.subcategoryId
                            },
                            {
                                name: LocationIdFieldName,
                                value: step.locationId
                            },
                            {
                                name: OtherLocationFieldName,
                                value: step.otherLocation
                            },
                            {
                                name: StewardshipCategoryIdFieldName,
                                value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                            },
                            {
                                name: ProspectPlanStatusCodeIdFieldName,
                                value: step.planStageId
                            },
                            {
                                name: AdditionalSolicitorsFieldName,
                                collectionValue: getTransformedSolicitors(step.solicitors)
                            },
                            {
                                name: SiteIdFieldName,
                                value: step.siteId
                            }
                        ]
                    }
                )
                    .then(function (reply) {
                        $rootScope.$broadcast("stepSaved");
                        return reply.data.id;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
            }

            /**
             * Edit an existing prospect/stewardship plan step or interaction.
             * 
             * @param {Object} step
             * @param {String} step.prospectId The system ID of the prospect.
             * @param {String} step.contactMethodId The system ID for the contact method to be used.
             * @param {String} step.objective The step's objective.
             * @param {Date} step.date The step's date.
             * @param {Number} step.statusCode The step's status code.
             * @param {String} step.comments The comments on the step.
             * @param {Object[]} step.participants
             * @param {String} step.participants.constituentId The system ID of the participant.
             * @param {String} step.categoryId The category of the step.
             * @param {String} step.subcategoryId The subcategory of the step.
             * @param {String} step.planStageId The system ID for the plan stage.
             * @param {Object[]} step.solicitors
             * @param {String} step.solicitors.constituentId The system ID of the solicitor.
             * @param {String} step.planId The system ID to which to add the step.
             * @param {frog.utils.prospectUtilities.PlanType} step.planType The plan type.
             * 
             * @returns {Promise<String>} The ID of the step saved.
             */
            function editStepAsync(step) {
                step = step || {};
                svc = bbuiShellService.create();

                return svc.dataFormSave(
                    StepEditId,
                    {
                        recordId: step.id,
                        values: [
                            {
                                name: InteractionTypeCodeIdFieldName,
                                value: step.contactMethodId
                            },
                            {
                                name: ObjectiveFieldName,
                                value: step.objective
                            },
                            {
                                name: DateFieldName,
                                value: step.date
                            },
                            {
                                name: StatusCodeFieldName,
                                value: step.statusCode
                            },
                            {
                                name: CommentFieldName,
                                value: step.comments
                            },
                            {
                                name: ParticipantsFieldName,
                                collectionValue: getTransformedParticipants(step.participants)
                            },
                            {
                                name: InteractionCategoryIdFieldName,
                                value: step.planType !== prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                            },
                            {
                                name: InteractionSubcategoryIdFieldName,
                                value: step.subcategoryId
                            },
                            {
                                name: LocationIdFieldName,
                                value: step.locationId
                            },
                            {
                                name: OtherLocationFieldName,
                                value: step.otherLocation
                            },
                            {
                                name: StewardshipCategoryIdFieldName,
                                value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                            },
                            {
                                name: ProspectPlanStatusCodeIdFieldName,
                                value: step.planStageId
                            },
                            {
                                name: AdditionalSolicitorsFieldName,
                                collectionValue: getTransformedSolicitors(step.solicitors)
                            }
                        ]
                    }
                )
                    .then(function (reply) {
                        $rootScope.$broadcast("stepSaved");
                        return reply.data.id;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
            }

            /**
             * Loads information associated with a given interaction or a given step for a stewardship or prospect plan.
             * 
             * @param {String} The id of the interaction/step to load.
             * 
             * @returns {Promise<Object>} return The loaded interaction/step.
             * @returns {String} return.interactionTypeCodeId The system ID for the interaction/step type.
             * @returns {String} return.objective The objective of the interaction/step.
             * @returns {Date} return.expectedDate The expected date of the interaction/step.
             * @returns {Number} return.statusCode The status code of the interaction/step.
             * @returns {String} return.comment The comment on the interaction/step.
             * @returns {String} return.categoryId The system ID for the category on the interaction/step.
             * @returns {String} return.subcategoryId The system ID for the subcategory on the interaction/step.
             * @returns {String} return.location The location of the interaction/step.
             * @returns {String} return.prospectPlanStatusCodeId The system ID for the prospest plan status code.
             * @returns {String} return.planId The system ID for the plan.
             * @returns {frog.utils.prospectUtilities.PlanType} return.planType The plan type.
             * 
             * @returns {Object[]} return.participants
             * @returns {String} return.participants.constituentid The system ID for the participant.
             * @returns {String} return.participants.name The name of the participant.
             * 
             * @returns {Object[]} return.solicitors
             * @returns {String} return.solicitors.constituentId The system ID for the solicitor.
             * @returns {String} return.solicitors.name The name of the solicitor.
             */
            function loadStepAsync(id) {
                svc = bbuiShellService.create();
                return svc.dataFormLoad(StepEditId, {
                    recordId: id
                })
                    .then(function (reply) {
                        var result = {
                            comment: "",
                            date: null,
                            interactionCategoryId: null,
                            interactionSubcategoryId: null,
                            interactionTypeCodeId: null,
                            location: "",
                            objective: "",
                            participants: [],
                            prospectPlanStatusCodeId: null,
                            solicitors: [],
                            statusCode: null,
                            stewardshipCategoryId: null
                        };

                        reply.data.values.forEach(function (dfi) {
                            switch (dfi.name) {
                                case InteractionTypeCodeIdFieldName:
                                    result.interactionTypeCodeId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;

                                case ObjectiveFieldName:
                                    result.objective = dfi.value;
                                    break;

                                case DateFieldName:
                                    result.date = dfi.value;
                                    break;

                                case StatusCodeFieldName:
                                    result.statusCode = dfi.value;
                                    break;

                                case CommentFieldName:
                                    result.comment = dfi.value;
                                    break;

                                case ParticipantsFieldName:
                                    angular.forEach(dfi.value, function (participantDfi) {
                                        var participant = {},
                                            firstName,
                                            keyName;

                                        angular.forEach(participantDfi, function (field) {
                                            switch (field.name) {
                                                case ConstituentIdFieldName:
                                                    participant.constituentId = field.value.toUpperCase();
                                                    break;

                                                case FirstNameFieldName:
                                                    firstName = field.value;
                                                    break;

                                                case KeyNameFieldName:
                                                    keyName = field.value;
                                                    break;
                                            }
                                        });

                                        participant.name = getFullName(frogResources, firstName, keyName);

                                        result.participants.push(participant);
                                    });

                                    break;

                                case InteractionCategoryIdFieldName:
                                    result.categoryId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;

                                case InteractionSubcategoryIdFieldName:
                                    result.subcategoryId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;

                                case LocationFieldName:
                                    result.location = dfi.value;
                                    break;

                                case ProspectPlanStatusCodeIdFieldName:
                                    result.prospectPlanStatusCodeId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;

                                case StewardshipCategoryIdFieldName:
                                    result.stewardshipCategoryId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;

                                case AdditionalSolicitorsFieldName:
                                    angular.forEach(dfi.value, function (participantDfi) {
                                        var solicitor = {},
                                            firstName,
                                            keyName;

                                        angular.forEach(participantDfi, function (field) {
                                            switch (field.name) {
                                                case FundraiserIdFieldName:
                                                    solicitor.constituentId = field.value.toUpperCase();
                                                    break;

                                                case FirstNameFieldName:
                                                    firstName = field.value;
                                                    break;

                                                case KeyNameFieldName:
                                                    keyName = field.value;
                                                    break;
                                            }
                                        });

                                        solicitor.name = getFullName(frogResources, firstName, keyName);

                                        result.solicitors.push(solicitor);
                                    });

                                    break;

                                case PlanTypeFieldName:
                                    result.planType = dfi.value;
                                    break;
                            }
                        });

                        return result;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
            }

            /**
             * Preload data for the contact report form.
             * 
             * @returns {Promise<Object>} return
             * @returns {Boolean} return.siteRequired Specifies whether or not a site is required for the user.
             * @returns {String} return.siteId The default site for the user.
             */
            function getContactReportPreloadAsync() {
                svc = bbuiShellService.create();
                return svc.dataFormLoad(StepAddId)
                    .then(function (reply) {
                        var result = {
                            siteRequired: false,
                            siteId: null
                        };

                        reply.data.values.forEach(function (dfi) {
                            switch (dfi.name) {
                                case SiteRequiredFieldName:
                                    result.siteRequired = dfi.value;
                                    break;

                                case SiteIdFieldName:
                                    result.siteId = toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                            }
                        });

                        return result;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
            }

        }])

        .factory("apiProducts", ["bbui", "bbuiShellService", "apiCache", "$q", function (bbui, bbuiShellService, apiCache, $q) {
            var apiProducts,
                svc;

            apiProducts = {
                productIsInstalledAsync: productIsInstalledAsync
            };

            return apiProducts;

            /**
             * Checks if a given product is installed. If the request fails, the error message will exist in the message property of the result.
             * 
             * @param {String} productId The installed product's ID.
             * @returns {Promise<Boolean>} result Indicates if the product is installed.
             */
            function productIsInstalledAsync(productId) {
                var InstalledProductsMobileDataListId = "c495bc28-db3a-48dc-a980-259b0a0b08c1",
                    cacheKey = "dataListLoad-" + InstalledProductsMobileDataListId,
                    cacheResult;

                if (!productId || typeof productId !== "string") {
                    return $q.reject({ message: "productId is required." });
                }

                productId = productId.toUpperCase();
                cacheResult = apiCache.cache.get(cacheKey);

                if (cacheResult) {
                    return $q.resolve(cacheResult.installedProducts.indexOf(productId) !== -1);
                }

                svc = bbuiShellService.create();

                return svc.dataListLoad(InstalledProductsMobileDataListId)
                    .then(function (reply) {
                        var i,
                            n,
                            rows = reply.data.rows,
                            data,
                            installedProducts = [];

                        data = {
                            installedProducts: installedProducts
                        };

                        for (i = 0, n = rows.length; i < n; ++i) {
                            installedProducts.push(rows[i].values[0].toUpperCase());
                        }

                        apiCache.cache.put(cacheKey, bbui.clone(data));
                        return installedProducts.indexOf(productId) !== -1;
                    }, function (reply) {
                        var result = {};

                        if (reply && reply.data && reply.data.message) {
                            result.message = reply.data.message;
                        }

                        return $q.reject(result);
                    });
            }
        }])

        .factory("api", ["infinityUtilities", "browserUtilities", "bbuiShellServiceConfig", "apiAuthenticate",
            "apiPortfolio", "apiProspectView", "apiContactReportOptions", "apiContactReport", "apiProducts",
            function (infinityUtilities, browserUtilities, bbuiShellServiceConfig, apiAuthenticate,
                apiPortfolio, apiProspectView, apiContactReportOptions, apiContactReport, apiProducts) {

                function getDatabaseName() {
                    return bbuiShellServiceConfig.databaseName;
                }

                function initialize() {
                    bbuiShellServiceConfig.baseUrl = "/" + infinityUtilities.getVirtualDirectory();
                    bbuiShellServiceConfig.databaseName = browserUtilities.getQueryStringParameters().databasename;
                }

                return {
                    getDatabaseName: getDatabaseName,
                    initialize: initialize,
                    authenticateAsync: apiAuthenticate.authenticateAsync,
                    logoutAsync: apiAuthenticate.logoutAsync,
                    getPortfolioAsync: apiPortfolio.getPortfolioAsync,
                    getPortfolioSettingsAsync: apiPortfolio.getPortfolioSettingsAsync,
                    getConstituentSearchListInformationAsync: apiPortfolio.getConstituentSearchListInformationAsync,
                    getProspectInfoAsync: apiProspectView.getProspectInfoAsync,
                    getProspectSummaryAsync: apiProspectView.getProspectSummaryAsync,
                    getRecentStepsAsync: apiProspectView.getRecentStepsAsync,
                    getConstituentSearchResultsAsync: apiPortfolio.getConstituentSearchResultsAsync,
                    getCountriesListAsync: apiPortfolio.getCountriesListAsync,
                    getStatesListAsync: apiPortfolio.getStatesListAsync,
                    getDefaultCountryAsync: apiPortfolio.getDefaultCountryAsync,
                    getCountryFormatsAsync: apiPortfolio.getCountryFormatsAsync,
                    getRecentGiftsAndCreditsAsync: apiProspectView.getRecentGiftsAndCreditsAsync,
                    getAddressesListAsync: apiProspectView.getAddressesListAsync,
                    getAdditionalRevenueDetailsAsync: apiProspectView.getAdditionalRevenueDetailsAsync,
                    getContactMethodsAsync: apiContactReportOptions.getContactMethodsAsync,
                    getPlanStagesAsync: apiContactReportOptions.getPlanStagesAsync,
                    getCategoriesAsync: apiContactReportOptions.getCategoriesAsync,
                    getSubcategoriesAsync: apiContactReportOptions.getSubcategoriesAsync,
                    getLocationsAsync: apiContactReportOptions.getLocationsAsync,
                    getPotentialParticipantsAsync: apiContactReportOptions.getPotentialParticipantsAsync,
                    getPotentialSolicitorsAsync: apiContactReportOptions.getPotentialSolicitorsAsync,
                    getSitesAsync: apiContactReportOptions.getSitesAsync,
                    getPlansAsync: apiContactReportOptions.getPlansAsync,
                    getStatusCodesAsync: apiContactReportOptions.getStatusCodesAsync,
                    loadStepAsync: apiContactReport.loadStepAsync,
                    addStepAsync: apiContactReport.addStepAsync,
                    editStepAsync: apiContactReport.editStepAsync,
                    getContactReportPreloadAsync: apiContactReport.getContactReportPreloadAsync,
                    productIsInstalledAsync: apiProducts.productIsInstalledAsync
                };

            }
        ])

        .factory('customizableRoot', [function () {
            return {

                /**
                 * Gets the name of the application's root folder.
                 * 
                 * Do not remove this function.
                 */
                getRootFolder: function () {
                    return 'frog';
                },

                /**
                 * Gets a value indicating whether or not this is a custom application.
                 * 
                 * Do not remove this function.
                 */
                isCustomApp: function () {
                    return false;
                }

                // Add other custom components here.
            };
        }])

        .factory('customizable', ['customizableRoot', function () {
            return {

                /**
                 * Gets the name of the application's root folder. Corresponds to customizableRoot.getRootFolder.
                 * 
                 * Do not remove this function.
                 */
                getRootFolder: function () {
                    return 'frogger';
                },

                /**
                 * Gets a value indicating whether or not this is a custom application. Corresponds to customizableRoot.isCustomApp.
                 * 
                 * Do not remove this function.
                 */
                isCustomApp: function () {
                    return true;
                }

                // Add other custom components here.
            };
        }]);
}());
