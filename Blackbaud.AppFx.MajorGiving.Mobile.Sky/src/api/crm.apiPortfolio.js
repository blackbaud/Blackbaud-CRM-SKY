/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    var noop = angular.noop;

    angular.module("frog.frogApi")
    .factory("apiPortfolio", ["bbuiShellService", "frogResources", "prospectUtilities", "infinityCache", "bbui", "$q",
    "infinityUtilities", 'customizable',
            function (bbuiShellService, frogResources, prospectUtilities, infinityCache, bbui, $q, 
                infinityUtilities, customizable) {

                var svc,
                    FUNDRAISER_IDMAP_ID = 'C606C99A-FE2F-4F3E-AB48-3F4463344E92', // AppUser.Fundraiser.IDMapper.xml
                    MYPORTFOLIOSETTINGS_VIEW_ID = "cc816f72-b91e-452c-b715-aa15a676e98d", // FundraiserPortfolio.Mobile.DataList.Settings.View.xml
                    SEARCHLISTINFORMATION_VIEW_ID = "48861a67-60fe-4438-b725-0ee3418eebbf", // SearchListInformation.Mobile.View.xml
                    PROSPECTSEARCH_DATALIST_ID = '5c14275b-01f7-44ec-9707-e076cea1d361', // ProspectSearch.Mobile.DataList.xml
                    COUNTRY_SIMPLELIST_ID = 'C9649672-353D-42E8-8C25-4D34BBABFBBA', //CountrySimpleList.xml
                    STATEABBREVIATION_SIMPLELIST_ID = "7FA91401-596C-4F7C-936D-6E41683121D7", //StateAbbreviationSimpleList.xml,
                    DEFAULTCOUNTRY_VIEW_ID = "679f844a-8cda-4180-83bc-3353d78a5aaf", // DefaultCountry.Mobile.View.xml
                    COUNTRYFORMAT_DATALIST_ID = "6fcbb42d-a009-493d-82b2-7b73b85649d2", // CountryFormat.Mobile.DataList
                    MYPORTFOLIO_DATALIST_ID = customizable.getMyPortfolioDatalistId(); 

                function transformProspects(dataListResults) {
                    var prospects = [];

                    dataListResults.rows.forEach(function (row) {
                        var prospectValues = row.values,
                            MYPORTFOLIO_PROSPECTID = 0,
                            MYPORTFOLIO_NEXTSTEPDATE = 3;

                        prospects.push({
                            name: customizable.getProspectName(prospectValues),
                            id: prospectValues[MYPORTFOLIO_PROSPECTID].toUpperCase(),
                            nextStepDate: prospectValues[MYPORTFOLIO_NEXTSTEPDATE]
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
                 * @param {Object} [options]
                 * @param {Boolean} [options.onlyPrimary=false]
                 * @param {Number} [options.sort=0]
                 * The sort option specified.
                 * * `0`: Last name
                 * * `1`: Next step
                 * TODO make this an enum in docs
                 * 
                 * @returns {Promise<Object>}
                 * @returns {Array} return.prospects
                 * @returns {String} return.prospects.id
                 * @returns {String} return.prospects.name
                 * @returns {Date|String|Moment|Array[]} return.prospects.nextStepDate
                 * @returns {Date} return.prospects.labelClass
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
                 * Get the portfolio list settings for this user.
                 *
                 * @param {Function} successCallback
                 * @param {Function} failureCallback
                 * @param {Function} finallyCallback
                 *
                 * @return {Object}
                 * @return {Boolean} return.onlyPrimary
                 * @return {Number} return.sort
                 * TODO docs enum
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
                            // The form failed to load for some reason, possibly insufficient rights.
                            failureCallback(failureData);
                        })
                        .finally(function () {
                            finallyCallback();
                        });

                }

                /**
                 * Get constituent search list information for the given search list.
                 *
                 * @param {String} [constituentSearchListId]
                 *
                 * @returns {Promise<Object>}
                 * @returns {Object[]} returns.optionalFilterFields
                 * @returns {String} returns.optionalFilterFields.fieldId
                 */
                function getConstituentSearchListInformationAsync(constituentSearchListId) {
                    var cacheKey,
                        cacheResult;

                    if (!constituentSearchListId || typeof constituentSearchListId !== "string") {
                        return $q.reject({
                            message: "constituentSearchListId is required"
                        });
                    }

                    constituentSearchListId = constituentSearchListId.toUpperCase();

                    cacheKey = "dataFormLoad-" + SEARCHLISTINFORMATION_VIEW_ID + "-" + constituentSearchListId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(
                        SEARCHLISTINFORMATION_VIEW_ID,
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
                 * Get the constituent search results for the user.
                 *
                 * @param {Object} [options]
                 * @param {Object[]} [options.parameters]
                 * @param {String} [options.parameters.id]
                 * @param {Object} [options.parameters.value]
                 * 
                 * @returns {Promise<Object>}
                 * @returns {Object[]} returns.constituentSearchResults
                 * @returns {String} returns.constituentSearchResults.id
                 * @returns {String} returns.constiteuntSearchResults.fullName
                 * @returns {String} returns.constituentSearchResults.city
                 * @returns {String} returns.constituentSearchResults.state
                 * @returns {String} returns.constituentSearchResults.postCode
                 */

                function getConstituentSearchResultsAsync(options) {

                    options = infinityUtilities.cloneOrNew(bbui, options);

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        PROSPECTSEARCH_DATALIST_ID,
                        undefined,
                        options
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            constituentSearchResult,
                            constituentSearchResults = [],
                            displayAddress,
                            PROSPECTSEARCH_ID = 0,
                            PROSPECTSEARCH_KEYNAME = 1,
                            PROSPECTSEARCH_CITY = 2,
                            PROSPECTSEARCH_STATE = 3,
                            PROSPECTSEARCH_POSTCODE = 4;

                        data = {
                            constituentSearchResults: constituentSearchResults
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            constituentSearchResult = reply.data.rows[i].values;

                            // Set displayAddress to use for ng-if in HTML.
                            if (!constituentSearchResult[PROSPECTSEARCH_CITY] || !constituentSearchResult[PROSPECTSEARCH_STATE] || !constituentSearchResult[PROSPECTSEARCH_POSTCODE]) {
                                displayAddress = false;
                            } else {
                                displayAddress = true;
                            }

                            constituentSearchResults.push({
                                id: infinityUtilities.toUpperIdOrNullIfEmpty(constituentSearchResult[PROSPECTSEARCH_ID]),
                                fullName: constituentSearchResult[PROSPECTSEARCH_KEYNAME],
                                city: constituentSearchResult[PROSPECTSEARCH_CITY],
                                state: constituentSearchResult[PROSPECTSEARCH_STATE],
                                postCode: constituentSearchResult[PROSPECTSEARCH_POSTCODE],
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

                // Get the Countries for the database

                function getCountriesListAsync() {
                    var cacheKey,
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

                //Get the states based on the country

                function getStatesListAsync(countryId, options) {

                    var cacheKey,
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
                         options)
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
                 * Get ID for default country.
                 *
                 * @returns {Guid} returns.countryId
                 */
                function getDefaultCountryAsync() {
                    var cacheKey,
                        cacheResult;

                    cacheKey = "dataFormLoad-" + DEFAULTCOUNTRY_VIEW_ID;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataFormLoad(DEFAULTCOUNTRY_VIEW_ID)
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
                 * @returns {Object[]} returns.formats
                 * @returns {Guid} returns.formats.id
                 * @returns {String} returns.formats.city
                 * @returns {String} returns.formats.state
                 * @returns {String} returns.formats.postCode
                 */
                function getCountryFormatsAsync() {
                    var cacheKey,
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
                            formats = [],
                            COUNTRYFORMAT_ID = 0,
                            COUNTRYFORMAT_CITY = 1,
                            COUNTRYFORMAT_STATE = 2,
                            COUNTRYFORMAT_POSTCODE = 3;
        
                        data = {
                            formats: formats
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            format = reply.data.rows[i].values;

                            data.formats.push({
                                id: infinityUtilities.toUpperIdOrNullIfEmpty(format[COUNTRYFORMAT_ID]),
                                city: format[COUNTRYFORMAT_CITY],
                                state: format[COUNTRYFORMAT_STATE],
                                postCode: format[COUNTRYFORMAT_POSTCODE]
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