/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    var noop = angular.noop;

    angular.module("frog.api")
        .factory("apiPortfolio", ["bbuiShellService", "frogResources", "infinityUtilities", "prospectUtilities", "infinityCache", "bbui", "$q",
            function (bbuiShellService, frogResources, infinityUtilities, prospectUtilities, infinityCache, bbui, $q) {

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
                            name: prospectUtilities.getFullName(frogResources, prospectValues[2], prospectValues[1]),
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
                    options = infinityUtilities.cloneOrNew(bbui, options);
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
                                cacheResult = infinityCache.cache.get(cacheKey);

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
                                        infinityCache.cache.put(cacheKey, bbui.clone(data));
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
                 * @param {String} constituentSearchListId The search list whose information is desired.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.optionalFilterFields The optional filter fields in use on the search list.
                 * @returns {String} return.optionalFilterFields[].fieldId The field ID of the optional filter field.
                 */
                function getConstituentSearchListInformationAsync(constituentSearchListId) {
                    var SearchListInformationViewId = "48861a67-60fe-4438-b725-0ee3418eebbf", // SearchListInformation.Mobile.View.xml
                        cacheKey,
                        cacheResult;

                    if (!constituentSearchListId || typeof constituentSearchListId !== "string") {
                        return $q.reject({
                            message: "constituentSearchListId is required"
                        });
                    }

                    constituentSearchListId = constituentSearchListId.toUpperCase();

                    cacheKey = "dataFormLoad-" + SearchListInformationViewId + "-" + constituentSearchListId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(
                        SearchListInformationViewId,
                        {
                            recordId: constituentSearchListId
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

                        infinityCache.cache.put(cacheKey, bbui.clone(result));
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

                    options = infinityUtilities.cloneOrNew(bbui, options);

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
                                    id: infinityUtilities.toUpperIdOrNullIfEmpty(constituentSearchResult[0]),
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
                    cacheResult = infinityCache.cache.get(cacheKey);

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

                            infinityCache.cache.put(cacheKey, bbui.clone(data));
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
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = infinityUtilities.cloneOrNew(bbui, options);
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

                            infinityCache.cache.put(cacheKey, bbui.clone(data));
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
                    cacheResult = infinityCache.cache.get(cacheKey);

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
                                            result.countryId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                            break;
                                    }
                                });
                            }

                            infinityCache.cache.put(cacheKey, bbui.clone(result));
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
                    cacheResult = infinityCache.cache.get(cacheKey);

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
                                    id: infinityUtilities.toUpperIdOrNullIfEmpty(format[0]),
                                    city: format[1],
                                    state: format[2],
                                    postCode: format[3]
                                });
                            }
                            infinityCache.cache.put(cacheKey, bbui.clone(data));
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
            }]);

}());