/// <reference path="../../../bower_components/angular/angular.js" />

/* global angular, console */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('ContactReportController', ContactReportController);

    ContactReportController.$inject = ['$scope', 'frogApi', 'frogResources', '$uibModalInstance', 'prospectUtilities', 'bbMoment', 'options'];

    /**
     * The contact report form. This form performs a variety of functions. It enables users to add and edit steps and interactions.
     * 
     * @param {Object} options
     * @param {String} options.prospectId The system ID of the prospect.
     * @param {Boolean} options.fileContactReport Indicates whether a contact report is being filed.
     * @param {Boolean} options.addStep Indicates whether a step is being added.
     * @param {Boolean} options.addInteraction Indicates whether an interaction is being added.
     * @param {Boolean} options.editInteraction Indicates whether an interaction is being edited.
     * @param {Boolean} options.editStep Indicates whether a step is being edited.
     * 
     * @param {Object} [options.stepInfo]
     * @param {String} options.stepInfo.contactMethodId The system ID of the contact method of the next step for the prospect.
     * @param {String} options.stepInfo.contactMethod The contact method of the next step for the prospect.
     * @param {String} options.stepInfo.objective The objective of the next step for the prospect.
     * @param {String} options.stepInfo.date The date of the next step for the prospect. Format "yyyy-MM-ddT00:00:00". Time info should be ignored.
     * @param {String} options.stepInfo.planId The system ID of the prospect plan associated with the next step for the prospect.
     * @param {String} options.stepInfo.planName The name of the prospect plan associated with the next step for the prospect.
     * @param {frog.util.prospectUtilities.PlanType} options.stepInfo.planType The prospect/stewardship plan type.
     */
    function ContactReportController($scope, frogApi, frogResources, $uibModalInstance, prospectUtilities, bbMoment, options) {

        options = options || {};
        options.stepInfo = options.stepInfo || {};
        options.stepInfo.planType = options.stepInfo.planType || prospectUtilities.PLAN_TYPE.NONE;

        var prospectId = options.prospectId,
            locals,
            loadingManager,
            incrementLoading,
            decrementLoading,
            ActionOption,
            ItemTypeOption,
            otherActions,
            isInteraction = false,
            currentPlanType,
            InteractionOrStepAddFormId = "8eab8484-8188-4e63-a514-e08bea349a05",
            OtherLocationId = "84A394FE-55B8-4737-9B2F-CC478766EC39",
            FormFeatureType = 1,
            SimpleListSecurityContext = {
                securityContextFeatureId: InteractionOrStepAddFormId,
                securityContextFeatureType: FormFeatureType
            };

        loadingManager = (function () {
            var loadingCount = 0;

            function checkDone() {
                locals.loading = loadingCount !== 0;
            }

            function increment() {
                ++loadingCount;
                checkDone();
            }

            function decrement() {
                --loadingCount;
                checkDone();
            }

            return {
                increment: increment,
                decrement: decrement
            };
        })();

        incrementLoading = loadingManager.increment;
        decrementLoading = loadingManager.decrement;

        ActionOption = {
            CompleteExistingInteraction: 0,
            CompleteExistingStep: 1,
            AddCompletedStep: 2,
            AddCompletedInteraction: 3
        };

        ItemTypeOption = {
            None: 0,
            Interaction: 1,
            PlanStep: 2
        };

        otherActions = [
            {
                value: null,
                label: frogResources.contactReport_otherAction_somethingDifferent
            },
            {
                value: ActionOption.CompleteExistingInteraction,
                label: frogResources.contactReport_otherAction_existingInteraction
            },
            {
                value: ActionOption.CompleteExistingStep,
                label: frogResources.contactReport_otherAction_existingStep
            },
            {
                value: ActionOption.AddCompletedStep,
                label: frogResources.contactReport_otherAction_addCompletedStep
            },
            {
                value: ActionOption.AddCompletedInteraction,
                label: frogResources.contactReport_otherAction_addCompletedInteraction
            }
        ];

        function setUpForPlan(planType) {
            currentPlanType = planType;

            loadStatuses(planType);
            loadCategories(planType);
            loadLocations();

            locals.showPlanOptions = (planType === prospectUtilities.PLAN_TYPE.PROSPECT);
            locals.showSubcategory = (planType === prospectUtilities.PLAN_TYPE.NONE || planType === prospectUtilities.PLAN_TYPE.PROSPECT);
            locals.showLocation = (planType === prospectUtilities.PLAN_TYPE.NONE || planType === prospectUtilities.PLAN_TYPE.PROSPECT);
            locals.displayParticipants = (planType === prospectUtilities.PLAN_TYPE.NONE || planType === prospectUtilities.PLAN_TYPE.PROSPECT);
            locals.displaySolicitors = (planType === prospectUtilities.PLAN_TYPE.PROSPECT);
            locals.displayComments = (planType === prospectUtilities.PLAN_TYPE.NONE || planType === prospectUtilities.PLAN_TYPE.PROSPECT);

            if (options.stepInfo.stepId) {
                if (planType === prospectUtilities.PLAN_TYPE.NONE) {
                    locals.defaultActionText = frogResources.contactReport_label_defaultInteractionText;
                } else {
                    locals.defaultActionText = frogResources.contactReport_label_defaultStepText;
                }
            } else {
                locals.defaultActionText = frogResources.contactReport_label_defaultNewInteractionText;
            }

            if (!locals.allowStatusChange) {
                // We're completing the step/interaction so we're setting the status to completed
                locals.selectedStatus = frogApi.getCompletedStatusCode(planType);
            }
        }

        function preloadContactReport() {
            incrementLoading();

            frogApi.getContactReportPreloadAsync()
                .then(function (response) {
                    locals.siteRequired = response.siteRequired;
                    locals.selectedSite = response.siteId;
                })
                .catch(function (error) {
                    console.warn("Failed reload of contact report form: " + error.message);
                })
                .finally(decrementLoading);
        }

        function loadParticipants() {
            locals.participantsLoading = true;

            frogApi.getPotentialParticipantsAsync(prospectId)
                .then(function (response) {
                    var participants = [];

                    response.potentialParticipants.forEach(function (participant) {
                        participants.push({
                            title: participant.name,
                            constituentId: participant.id
                        });
                    });

                    locals.potentialParticipants = participants;
                })
                .catch(function (error) {
                    console.warn("Failed to load potential participants: " + error.message);
                })
                .finally(function () {
                    locals.participantsLoading = false;
                });
        }

        function loadSolicitors() {
            locals.solicitorsLoading = true;

            frogApi.getPotentialSolicitorsAsync(locals.selectedPlan, SimpleListSecurityContext)
                .then(function (response) {
                    var solicitors = [];

                    response.potentialSolicitors.forEach(function (solicitor) {
                        solicitors.push({
                            title: solicitor.name,
                            constituentId: solicitor.id
                        });
                    });

                    locals.potentialSolicitors = solicitors;
                })
                .catch(function (error) {
                    // WI# 673039
                    console.warn("Potential solicitors failed to load: " + error.message);
                })
                .finally(function () {
                    locals.solicitorsLoading = false;
                });
        }

        function saveForm() {
            if (!locals.fileContactReportForm.$valid) {
                return;
            }

            if (locals.selectedItem) {
                editExistingStep(locals.selectedItem.id);
            } else {
                addNewStep();
            }

            function addNewStep() {
                var step = {
                    prospectId: prospectId,
                    contactMethodId: locals.selectedContactMethod,
                    objective: locals.objective,
                    date: locals.stepDate,
                    statusCode: locals.selectedStatus,
                    comments: locals.comments,
                    participants: locals.participants,
                    categoryId: locals.selectedCategory,
                    subcategoryId: locals.selectedSubcategory,
                    locationId: locals.selectedLocation,
                    otherLocation: locals.otherLocation,
                    planStageId: locals.selectedPlanStage,
                    solicitors: locals.solicitors,
                    planId: locals.selectedPlan,
                    planType: currentPlanType,
                    siteId: locals.selectedSite
                };

                startSaving();

                frogApi.addStepAsync(step)
                    .then(function () {
                        $uibModalInstance.close();
                    })
                    .catch(function (error) {
                        displayServiceError($scope, error);
                        stopSaving();
                    });
            }

            function editExistingStep(id) {
                var step = {
                    id: id,
                    planType: currentPlanType,
                    contactMethodId: locals.selectedContactMethod,
                    objective: locals.objective,
                    date: locals.stepDate,
                    statusCode: locals.selectedStatus,
                    comments: locals.comments,
                    participants: locals.participants,
                    categoryId: locals.selectedCategory,
                    subcategoryId: locals.selectedSubcategory,
                    locationId: locals.selectedLocation,
                    otherLocation: locals.otherLocation,
                    planStageId: locals.selectedPlanStage,
                    solicitors: locals.solicitors
                };

                startSaving();

                frogApi.editStepAsync(step)
                    .then(function () {
                        $uibModalInstance.close($scope.data);
                    })
                    .catch(function (error) {
                        displayServiceError($scope, error);
                        stopSaving();
                    });
            }

            function clearErrors() {
                locals.serviceErrorMessage = "";
            }

            function startSaving() {
                locals.isSaving = true;
                clearErrors();
            }

            function stopSaving() {
                locals.isSaving = false;
            }

            function displayServiceError($scope, response) {
                if (response && response.message) {
                    locals.serviceErrorMessage = response.message;
                } else {
                    locals.serviceErrorMessage = "Unknown error";
                }
            }
        }

        function loadContactMethods() {
            incrementLoading();

            frogApi.getContactMethodsAsync(SimpleListSecurityContext)
                .then(function (response) {
                    locals.contactMethods = response.contactMethods;

                    if (options.stepInfo.contactMethodId) {
                        var method = locals.contactMethods.filter(function (contactMethod) {
                            return contactMethod.id === options.stepInfo.contactMethodId;
                        })[0];

                        if (method) {
                            locals.selectedContactMethod = method.id;
                        }
                    }
                })
                .catch(function (error) {
                    // WI# 673039
                    console.warn("Contact methods failed to load: " + error.message);
                })
                .finally(decrementLoading);
        }

        function loadPlanStages() {
            incrementLoading();

            frogApi.getPlanStagesAsync(SimpleListSecurityContext)
                .then(function (response) {
                    locals.planStages = response.planStages;
                })
                .catch(function (error) {
                    // WI# 673039
                    console.warn("Plan stages failed to load:" + error.message);
                })
                .finally(decrementLoading);
        }

        function loadCategories(planType) {
            incrementLoading();

            frogApi.getCategoriesAsync(planType, SimpleListSecurityContext)
                .then(function (response) {
                    locals.categories = response.categories;
                })
                .catch(function (error) {
                    // WI# 673039
                    console.warn("Categories failed to load: " + error.message);
                })
                .finally(decrementLoading);
        }

        function loadLocations() {
            incrementLoading();

            frogApi.getLocationsAsync(prospectId, SimpleListSecurityContext)
                .then(function (response) {
                    locals.locations = response.locations;
                })
                .catch(function (error) {
                    // WI# 673039
                    console.warn("Locations failed to load: " + error.message);
                })
                .finally(decrementLoading);
        }

        function loadPlans() {
            if (locals.choosePlan) {
                incrementLoading();

                frogApi.getPlansAsync(prospectId)
                    .then(function (response) {
                        locals.plans = response.plans;
                    })
                    .catch(function (error) {
                        // WI# 673039
                        console.warn("Plans failed to load: " + error.message);
                    })
                    .finally(decrementLoading);
            }
        }

        function loadStatuses(planType) {
            if (locals.allowStatusChange) {
                incrementLoading();

                frogApi.getStatusCodesAsync(planType)
                    .then(function (reply) {
                        locals.statusCodes = reply.statusCodes;
                        if (!locals.selectedStatus) {
                            locals.selectedStatus = locals.statusCodes[0].value;
                        }
                    })
                    .catch(function (error) {
                        // WI# 673039
                        console.warn("Statuses failed to load: " + error.message);
                    })
                    .finally(decrementLoading);
            }
        }

        function setContactReportInfo() {
            if (options.stepInfo.planName) {
                locals.planName = options.stepInfo.planName;
                setUpForPlan(options.stepInfo.planType);
            }

            if (locals.selectedActionOption === null) {
                locals.contactMethod = options.stepInfo.contactMethod;
                locals.objective = options.stepInfo.objective;
            }

            // This needs to be a javascript Date object rather than a moment to be used for HTML input fields.
            locals.stepDate = new Date();
        }

        function loadSecurity() {
            var SiteSecurityProductFlagId = "133F9BCA-00F1-4007-9792-586B931340C6";

            locals.displaySite = false;

            // Only interactions have site.
            if (isInteraction && !options.editInteraction) {
                incrementLoading();

                frogApi.productIsInstalledAsync(SiteSecurityProductFlagId)
                    .then(function (result) {
                        locals.displaySite = result;

                        if (result) {
                            return frogApi.getSitesAsync();
                        }
                    })
                    .then(function (result) {
                        locals.sites = result.sites;
                    })
                    .catch(function (error) {
                        console.warn("Checking SiteSecurity and/or loading sites failed: " + error.message);
                    })
                    .finally(decrementLoading);
            } else {
                locals.displaySite = false;
            }
        }

        function loadContactReportFields() {
            preloadContactReport();
            setContactReportInfo();
            loadContactMethods();
            loadPlanStages();
            loadSecurity();
            loadPlans();
        }

        function loadInteractions() {
            var options = {
                parameters: [
                    {
                        id: "MAXSTEPS",
                        value: 10000
                    },
                    {
                        id: "ITEMTYPEFILTER",
                        value: ItemTypeOption.Interaction
                    },
                    {
                        id: "INCLUDECOMPLETED",
                        value: false
                    },
                    {
                        id: "INCLUDEPENDING",
                        value: true
                    },
                    {
                        id: "SHOULDORDERASCENDING",
                        value: true
                    }
                ]
            };

            locals.interactions = [];

            locals.interactionsLoading = true;
            frogApi.getRecentStepsAsync(prospectId, options)
                .then(function (response) {
                    var transformedInteractions = [];

                    angular.forEach(response.steps, function (interaction) {
                        var title,
                            description;

                        title = (interaction.contactMethod ? interaction.contactMethod + " - " : "") + interaction.objective;
                        description = bbMoment(interaction.date).format("l");

                        transformedInteractions.push({
                            title: title,
                            description: description,
                            id: interaction.id
                        });
                    });

                    locals.interactions = transformedInteractions;
                })
                .catch(function (error) {
                    console.warn("Failed to load interactions: " + error.message);
                })
                .finally(function () {
                    locals.interactionsLoading = false;
                });
        }

        function loadSteps() {
            var planNames = [],
                options = {
                    parameters: [
                        {
                            id: "MAXSTEPS",
                            value: 10000
                        },
                        {
                            id: "ITEMTYPEFILTER",
                            value: ItemTypeOption.PlanStep
                        },
                        {
                            id: "INCLUDECOMPLETED",
                            value: false
                        },
                        {
                            id: "INCLUDEPENDING",
                            value: true
                        },
                        {
                            id: "SHOULDORDERASCENDING",
                            value: true
                        }
                    ]
                };

            locals.steps = [];
            locals.planNames = [];

            locals.stepsLoading = true;
            frogApi.getRecentStepsAsync(prospectId, options)
                .then(function (response) {
                    var transformedSteps = [];

                    angular.forEach(response.steps, function (step) {
                        var title,
                            description,
                            category;

                        title = (step.contactMethod ? step.contactMethod + " - " : "") + step.objective;
                        description = bbMoment(step.date).format("l") + " | " + step.planName;
                        category = step.planName;

                        transformedSteps.push({
                            title: title,
                            description: description,
                            category: category,
                            id: step.id,
                            planId: step.planId
                        });

                        if (step.planName && planNames.indexOf(step.planName) === -1) {
                            planNames.push(step.planName);
                        }
                    });

                    locals.steps = transformedSteps;
                    locals.planNames = planNames;
                })
                .catch(function (error) {
                    console.warn("Failed to load steps: " + error.message);
                })
                .finally(function () {
                    locals.stepsLoading = false;
                });
        }

        function loadStep(id) {
            incrementLoading();

            frogApi.loadStepAsync(id)
                .then(function (response) {
                    var participants = [],
                        solicitors = [];

                    angular.forEach(response.participants, function (participant) {
                        participants.push({
                            title: participant.name,
                            constituentId: participant.constituentId
                        });
                    });

                    angular.forEach(response.solicitors, function (solicitor) {
                        solicitors.push({
                            title: solicitor.name,
                            constituentId: solicitor.constituentId
                        });
                    });

                    locals.selectedContactMethod = response.interactionTypeCodeId;
                    locals.objective = response.objective;
                    locals.selectedStatus = response.statusCode;
                    locals.comments = response.comment;
                    locals.selectedPlanStage = response.prospectPlanStatusCodeId;
                    locals.selectedCategory = response.categoryId;
                    locals.selectedSubcategory = response.subcategoryId;
                    locals.siteId = response.siteId;
                    locals.participants = participants;
                    locals.solicitors = solicitors;

                    if (options.editStep || options.editInteraction) {
                        locals.stepDate = response.date;
                    } else {
                        // Since we're completing the step, default to the current date
                        locals.stepDate = new Date();
                    }

                    if (response.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP) {
                        locals.selectedCategory = response.stewardshipCategoryId;
                    } else {
                        locals.selectedCategory = response.categoryId;
                    }

                    // Default location
                    if (response.location) {
                        if (locals.locations) {
                            // Locations have been loaded
                            matchLocation(response.location);
                        } else {
                            // Locations have not been loaded
                            incrementLoading();

                            frogApi.getLocationsAsync(prospectId, SimpleListSecurityContext)
                                .then(function (getLocationResponse) {
                                    locals.locations = getLocationResponse.locations;
                                    matchLocation(response.location);
                                })
                                .catch(function (error) {
                                    // WI# 673039
                                    console.warn("Locations failed to load: " + error.message);
                                })
                                .finally(decrementLoading);
                        }
                    }

                    setUpForPlan(response.planType);
                })
                .catch(function (error) {
                    console.warn("Failed to load step: " + error.message);
                })
                .finally(decrementLoading);
        }

        function matchLocation(searchLocation) {
            locals.selectedLocation = null;

            // Find location among known addresses
            angular.forEach(locals.locations, function (location) {
                if (location.name.includes(searchLocation)) {
                    locals.selectedLocation = location.id;
                }
            });

            // Location not found among known addresses
            if (locals.selectedLocation === null) {
                locals.selectedLocation = OtherLocationId;
                locals.otherLocation = searchLocation;
            }
        }

        function restoreDefaults() {
            locals.selectedActionOption = null;
        }

        function initializeData() {
            isInteraction = false;

            locals.allowStatusChange = false;
            locals.commentsRequired = false;
            locals.comments = "";
            locals.choosePlan = false;
            locals.chooseItemType = ItemTypeOption.None;
            locals.selectedLocation = null;
            locals.otherLocation = "";
            locals.participants = [];
            locals.selectedContactMethod = null;
            locals.selectedItem = null;
            locals.selectedPlan = null;
            locals.selectedPlanStage = null;
            locals.selectedInteractionArray = [];
            locals.selectedSite = null;
            locals.selectedStepArray = [];
            locals.solicitors = [];
            locals.contactMethodRequired = false;
            locals.loading = false;
            locals.objective = "";
            locals.planName = "";
            locals.selectedCategory = null;
            locals.selectedSiteId = null;
            locals.serviceErrorMessage = "";
            locals.showPlanOptions = false;
            locals.useOtherLocation = false;
            locals.siteRequired = false;
            locals.subcategoryId = null;

            locals.stepDate = new Date();

            if (options.fileContactReport) {
                locals.modalHeader = frogResources.fileContactReport;
                locals.commentsRequired = true;
                locals.showOtherActionOptions = true;

                if (locals.selectedActionOption === null) {
                    if (options.stepInfo.stepId) {
                        locals.selectedItem = {
                            id: options.stepInfo.stepId,
                            planType: options.stepInfo.planType,
                            title: options.stepInfo.planName
                        };
                        loadStep(options.stepInfo.stepId);
                    } else {
                        isInteraction = true;
                        locals.contactMethodRequired = true;
                        setUpForPlan(prospectUtilities.PLAN_TYPE.NONE);
                    }
                }

            } else if (options.addStep) {
                locals.modalHeader = frogResources.addAStep;
                locals.showPlanOptions = true;
                locals.choosePlan = true;
                locals.allowStatusChange = true;

            } else if (options.addInteraction) {
                isInteraction = true;
                locals.modalHeader = frogResources.addAnInteraction;
                locals.contactMethodRequired = true;
                locals.allowStatusChange = true;
                setUpForPlan(prospectUtilities.PLAN_TYPE.NONE);

            } else if (options.editStep) {
                locals.modalHeader = frogResources.editAStep;
                locals.showPlanOptions = true;
                locals.choosePlan = false;
                locals.allowStatusChange = true;

                if (options.stepInfo.stepId) {
                    locals.selectedItem = {
                        id: options.stepInfo.stepId,
                        planType: options.stepInfo.planType,
                        title: options.stepInfo.planName,
                        planId: options.stepInfo.planId
                    };
                }

                locals.selectedPlan = locals.selectedItem.planId;
                loadStep(options.stepInfo.stepId);

            } else if (options.editInteraction) {
                isInteraction = true;
                locals.modalHeader = frogResources.editAnInteraction;
                locals.contactMethodRequired = true;
                locals.allowStatusChange = true;

                if (options.stepInfo.stepId) {
                    locals.selectedItem = {
                        id: options.stepInfo.stepId,
                        planType: options.stepInfo.planType,
                        title: options.stepInfo.planName
                    };
                }

                loadStep(options.stepInfo.stepId);

            }
        }

        function initialize() {
            $scope.frogResources = frogResources;
            $scope.locals = locals = {
                initialStepInfo: options.stepInfo,
                ItemTypeOption: ItemTypeOption,
                loadParticipants: loadParticipants,
                loadSolicitors: loadSolicitors,
                loadInteractions: loadInteractions,
                loadSteps: loadSteps,
                otherActions: otherActions,
                restoreDefaults: restoreDefaults,
                saveForm: saveForm,
                selectedActionOption: null
            };

            if (options.fileContactReport && !options.stepInfo.stepId) {
                // We'll be defaulting the form to add a completed interaction so we need to remove that action form the dropdown.
                locals.otherActions = otherActions.filter(function (option) {
                    return option.value !== ActionOption.AddCompletedInteraction;
                });
            }

            // Subcategory is dependent upon category.
            $scope.$watch("locals.selectedCategory", function (newValue) {
                // Reset the subcategories so we don't have invalid values.
                locals.subcategories = [];

                if (newValue) {
                    incrementLoading();

                    frogApi.getSubcategoriesAsync(newValue, SimpleListSecurityContext)
                        .then(function (response) {
                            locals.subcategories = response.subcategories;
                        })
                        .catch(function (error) {
                            // WI# 673039
                            console.warn("Failed to load subcategories: " + error.message);
                        })
                        .finally(decrementLoading);
                }
            });

            // Other location field should only be used when the Other option is selected
            $scope.$watch("locals.selectedLocation", function (newValue) {
                locals.useOtherLocation = (newValue !== null && newValue.toUpperCase() === OtherLocationId);

                if (!locals.useOtherLocation) {
                    locals.otherLocation = "";
                }
            });

            // Show different values if this is a prospect plan or a stewardship plan
            $scope.$watch("locals.selectedPlan", function (newValue) {
                if (!locals.plans || !newValue) {
                    return;
                }

                var plan = locals.plans.filter(function (planObj) {
                    return planObj.id === newValue;
                })[0];

                setUpForPlan(plan.planType);
            });

            $scope.$watch("locals.selectedInteractionArray", function (newValue) {
                if (newValue.length === 0) {
                    if (locals.chooseItemType) {
                        locals.selectedItem = null;
                    }

                    return;
                }

                locals.selectedItem = newValue[0];
                loadStep(locals.selectedItem.id);
            });

            $scope.$watch("locals.selectedStepArray", function (newValue) {
                if (newValue.length === 0) {
                    if (locals.chooseItemType) {
                        locals.selectedItem = null;
                    }

                    return;
                }

                locals.selectedItem = newValue[0];
                locals.selectedPlan = locals.selectedItem.planId;
                loadStep(locals.selectedItem.id);
            });

            $scope.$watch("locals.selectedActionOption", function (newValue) {
                initializeData();
                switch (newValue) {
                    case null:
                        break;

                    case ActionOption.CompleteExistingInteraction:
                        locals.chooseItemType = ItemTypeOption.Interaction;
                        break;

                    case ActionOption.CompleteExistingStep:
                        locals.chooseItemType = ItemTypeOption.PlanStep;
                        break;

                    case ActionOption.AddCompletedInteraction:
                        isInteraction = true;
                        locals.contactMethodRequired = true;
                        setUpForPlan(prospectUtilities.PLAN_TYPE.NONE);
                        break;

                    case ActionOption.AddCompletedStep:
                        locals.choosePlan = true;
                        break;

                    default:
                        console.warn("Unknown action selected.");
                }

                loadContactReportFields();
            });

            initializeData();
        }

        initialize();
    }

}());
