/*jshint jasmine: true */
/*globals module, inject, angular, $ */

// TODO WI# 673039
// File a contact report button click triggers appropriate action with appropriate params
// File a contact report button is disabled when user does not have rights

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        $q,
        slug,
        testUtils,
        bbMoment,

        state,

        template = "views/prospects/prospect.html",

        // Layer 1
        PROSPECTVIEWWRAPPER = "[bb-frog-testid='prospectViewWrapper']",

        // Layer 2
        NAME = "[bb-frog-testid='title']",
        PICTURE = "[bb-frog-testid='picture']",
        PROSPECTVIEW = "[bb-frog-testid='prospectView']",
        PROSPECTERROR = "[bb-frog-testid='prospectError']",

        // Layer 3
        PROSPECTLABELS = "[bb-frog-testid='prospectLabels']",
        PRIMARYBUSINESS = "[bb-frog-testid='primaryBusiness']",
        SPOUSE = "[bb-frog-testid='spouse']",
        PRIMARYMEMBER = "[bb-frog-testid='primaryMember']",
        PROSPECTMANAGER = "[bb-frog-testid='prospectManager']",
        NEXTSTEP = "[bb-frog-testid='nextStep']",
        ERRORMESSAGE = "[bb-frog-testid='errorMessage']",
        CONTACTBAR = "[bb-frog-testid='contactBar']",

        // Layer 4
        DECEASED = "[bb-frog-testid='deceased']",
        INACTIVE = "[bb-frog-testid='inactive']",
        JOBTITLE = "[bb-frog-testid='jobTitle']",
        PRIMARYBUSINESSNAME = "[bb-frog-testid='primaryBusinessName']",
        SPOUSENAME = "[bb-frog-testid='spouseName']",
        SPOUSEDECEASED = "[bb-frog-testid='spouseDeceased']",
        PRIMARYMEMBERNAME = "[bb-frog-testid='primaryMemberName']",
        PROSPECTMANAGERNAME = "[bb-frog-testid='prospectManagerName']",
        CALLBTN = "[bb-frog-testid='callBtn']",
        CALLDROPDOWN = "[bb-frog-testid='callDropdown']",
        TEXTBTN = "[bb-frog-testid='textBtn']",
        TEXTDROPDOWN = "[bb-frog-testid='textDropdown']",
        EMAILBTN = "[bb-frog-testid='emailBtn']",
        EMAILDROPDOWN = "[bb-frog-testid='emailDropdown']",
        NEXTSTEPCONTACTMETHOD = "[bb-frog-testid='nextStepContactMethod']",
        NEXTSTEPOBJECTIVE = "[bb-frog-testid='nextStepObjective']",
        NEXTSTEPLOCATION = "[bb-frog-testid='nextStepLocation']",
        NEXTSTEPLABEL = "[bb-frog-testid='nextStepLabel']",
        NEXTSTEPDATE = "[bb-frog-testid='nextStepDate']",
        NEXTSTEPTIME = "[bb-frog-testid='nextStepTime']",
        NEXTSTEPCOMMENTS = "[bb-frog-testid='nextStepComments']",
        NEXTSTEPCAPTION = "[bb-frog-testid='nextStepCaption']",
        NEXTINTERACTIONCAPTION = "[bb-frog-testid='nextInteractionCaption']",
        NEXTSTEPPLANNAME = "[bb-frog-testid='nextStepPlanName']";

    function getProspectLink(id, name) {
        return {
            prospectId: slug.prependSlug(name, id),
            prospectName: name
        };
    }

    function compileFormWithState(controllerState, rootState) {
        controllerState = controllerState || {};

        $scope.prospectPage = {};
        angular.extend($scope, rootState);
        angular.extend($scope.prospectPage, controllerState);

        var el = angular.element('<div>' + $templateCache.get(template) + '</div>');
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return el;
    }

    /**
     * @private
     * Check the contact info button and dropdown.
     *
     * @param {Object} formDOM
     *
     * @param {Object[]} expectedContacts
     * @param {String} expectedContacts.text
     * @param {String} expectedContacts.link
     * @param {Boolean} expectedContacts.confidential
     * @param {Boolean} expectedMenuOpen
     * @param {String} btnSelector
     * The contact info button DOM element selector.
     * @param {String} dropdownSelector
     * The contact info dropdown DOM element selector.
     * @param {String} confidentialSelector
     * The contact info confidential DOM element selector.
     */
    function checkContactInfo(formDOM, expectedContacts, expectedMenuOpen, btnSelector, dropdownSelector, confidentialSelector) {

        var btn,
            dropdown,
            contactList,
            link,
            i,
            confidential;

        btn = formDOM.find(btnSelector);
        dropdown = formDOM.find(dropdownSelector);

        expect(btn).toExist();
        expect(dropdown).toExist();

        if (expectedContacts && expectedContacts.length) {

            expect(btn[0]).not.toBeDisabled();
            if (expectedMenuOpen) {
                expect(dropdown).toHaveClass("open");
            } else {
                expect(dropdown).not.toHaveClass("open");
            }

            contactList = dropdown.find("[data-bbauto-index]");
            expect(contactList.length).toBe(expectedContacts.length);
            for (i = 0; i < contactList.length; ++i) {

                link = $(contactList[i]);

                expect(link).toExist("link");
                expect(link.text().trim()).toBe(expectedContacts[i].text);
                expect(link).toHaveAttr("href", expectedContacts[i].link);

                if (confidentialSelector) {
                    confidential = link.find(confidentialSelector);
                    if (expectedContacts[i].confidential) {
                        expect(confidential).toExist();
                    } else {
                        expect(confidential).not.toExist();
                    }
                }

            }

        } else {
            expect(btn[0]).toBeDisabled();
            expect(dropdown).not.toHaveClass("open");
        }

    }

    /**
     * @private
     *
     * @param {Object} formDOM
     *
     * @param {Object} expectedState
     *
     * @param {Boolean} expectedState.hasNextStep
     * @param {String} [expectedState.nextStepContactMethod]
     * @param {String} [expectedState.nextStepObjective]
     * @param {String} [expectedState.nextStep]
     * @param {String} [expectedState.nextStepLabelClass]
     * @param {Moment} [expectedState.nextStepTime]
     * @param {String} [expectedState.nextStepLocation]
     * @param {String} [expectedState.nextStepComments]
     * @param {String} [expectedState.nextStepPlanName]
     */
    function checkNextStep(formDOM, expectedState) {

        var nextStepContactMethod,
            nextStepObjective,
            nextStepLabel,
            nextStepDate,
            nextStepTime,
            nextStepLocation,
            nextStepComments,
            nextStepCaption,
            nextInterationCaption,
            nextStepPlanName;

        if (expectedState.hasNextStep) {
            expect(formDOM.find(NEXTSTEP)).toExist();

            // Layer 4

            expect(expectedState.nextStepObjective).toBeDefined("Invalid test - need next step objective");
            expect(expectedState.nextStep).toBeDefined("Invalid test - need next step text");

            nextStepContactMethod = formDOM.find(NEXTSTEPCONTACTMETHOD);
            nextStepObjective = formDOM.find(NEXTSTEPOBJECTIVE);
            nextStepLabel = formDOM.find(NEXTSTEPLABEL);
            nextStepDate = formDOM.find(NEXTSTEPDATE);
            nextStepTime = formDOM.find(NEXTSTEPTIME);
            nextStepLocation = formDOM.find(NEXTSTEPLOCATION);
            nextStepComments = formDOM.find(NEXTSTEPCOMMENTS);
            nextStepCaption = formDOM.find(NEXTSTEPCAPTION);
            nextInterationCaption = formDOM.find(NEXTINTERACTIONCAPTION);
            nextStepPlanName = formDOM.find(NEXTSTEPPLANNAME);

            if (expectedState.nextStepContactMethod) {
                expect(nextStepContactMethod).toExist();
                expect(nextStepContactMethod.text()).toBe(expectedState.nextStepContactMethod + " - ");
            } else {
                expect(nextStepContactMethod).not.toExist();
            }

            expect(nextStepObjective).toExist();
            expect(nextStepObjective.text()).toBe(expectedState.nextStepObjective);

            if (expectedState.nextStepLabelClass) {
                expect(nextStepDate).not.toExist();
                expect(nextStepLabel).toExist();
                expect(nextStepLabel.text()).toBe(expectedState.nextStep);
                expect(nextStepLabel).toHaveClass(expectedState.nextStepLabelClass);
            } else {
                expect(nextStepDate).toExist();
                expect(nextStepDate.text()).toBe(expectedState.nextStep);
                expect(nextStepLabel).not.toExist();
            }

            if (expectedState.nextStepTime) {
                expect(nextStepTime).toExist();
                expect(nextStepTime.text()).toBe(expectedState.nextStepTime);
            } else {
                expect(nextStepTime).not.toExist();
            }

            if (expectedState.nextStepLocation) {
                expect(nextStepLocation).toExist();
                nextStepLocation = nextStepLocation.find("a");
                expect(nextStepLocation).toExist();
                expect(nextStepLocation).toHaveAttr("href", "http://maps.google.com/?q=" + encodeURIComponent(expectedState.nextStepLocation));
                expect(nextStepLocation.text()).toBe(expectedState.nextStepLocation);
            } else {
                expect(nextStepLocation).not.toExist();
            }

            if (expectedState.nextStepComments) {
                expect(nextStepComments).toExist();
                expect(nextStepComments.text()).toBe(expectedState.nextStepComments);
            } else {
                expect(nextStepComments).not.toExist();
            }

            if (expectedState.nextStepPlanName) {
                expect(nextStepPlanName).toExist();
                expect(nextStepCaption).toExist();
                expect(nextInterationCaption).not.toExist();
                expect(nextStepPlanName.text()).toBe(expectedState.nextStepPlanName);
            } else {
                expect(nextStepPlanName).not.toExist();
                expect(nextStepCaption).not.toExist();
                expect(nextInterationCaption).toExist();
            }

        } else {
            expect(formDOM.find(NEXTSTEP)).not.toExist();
        }

    }

    /**
     * @private
     *
     * @param {Object} formDOM
     *
     * @param {Object} expectedState
     * @param {String} expectedState.displayName
     * @param {String} expectedState.pictureString
     * @param {Boolean} expectedState.loading
     *
     * @param {Object[]} expectedState.phoneNumbers
     * @param {String} expectedState.phoneNumbers.number
     * @param {Boolean} expectedState.callMenuOpen
     * @param {Boolean} expectedState.textMenuOpen
     * @param {Object[]} expectedState.emailAddresses
     * @param {String} expectedState.emailAddresses.address
     * @param {Boolean} expectedState.emailMenuOpen
     *
     * @param {Boolean} expectedState.hasError
     * @param {String} expectedState.errorMessage
     *
     * @param {Boolean} expectedState.hasLabels
     * @param {Boolean} expectedState.deceased
     * @param {Boolean} expectedState.inactive
     *
     * @param {Boolean} expectedState.hasBusiness
     * @param {String} expectedState.businessName
     * @param {String} expectedState.jobTitle
     *
     * @param {Boolean} expectedState.hasSpouse
     * @param {String} expectedState.spouseName
     * @param {Boolean} expectedState.spouseDeceased
     *
     * @param {Boolean} expectedState.hasNextStep
     * @param {String} [expectedState.nextStepContactMethod]
     * @param {String} [expectedState.nextStepObjective]
     * @param {String} [expectedState.nextStep]
     * @param {String} [expectedState.nextStepLabelClass]
     * @param {Moment} [expectedState.nextStepTime]
     * @param {String} [expectedState.nextStepLocation]
     * @param {String} [expectedState.nextStepComments]
     * @param {String} [expectedState.nextStepPlanName]
     *
     * @param {String} [expectedState.hasProspectManager]
     * @param {String} [expectedState.prospectManagerName]
     *
     * @param {Boolean} expectedState.hasPrimaryMember
     * @param {String} [expectedState.primaryMemberName]
     
     */
    function checkState(formDOM, expectedState) {

        var name,
            picture,
            errorMessage,
            contactBar,
            phones = [],
            emails = [],
            deceased,
            inactive,
            jobTitle,
            businessName,
            spouseName,
            spouseLink,
            spouseDeceased,
            primaryMemberName,
            primaryMemberLink,
            prospectManagerName,
            prospectManagerLink;

        expectedState.phoneNumbers = expectedState.phoneNumbers || [];
        expectedState.emailAddresses = expectedState.emailAddresses || [];

        testUtils.checkHtml(formDOM);

        // Layer 1

        expect(formDOM.find(PROSPECTVIEWWRAPPER)).toExist();

        // Layer 2

        expect(expectedState.displayName).toBeDefined("Invalid test - need display name");
        name = formDOM.find(NAME);
        picture = formDOM.find(PICTURE);

        if (expectedState.hasError) {
            expect(formDOM.find(PROSPECTVIEW)).not.toExist();
            expect(formDOM.find(PROSPECTERROR)).toExist();

            expect(name).not.toExist();
            expect(picture).not.toExist();

            // Layer 3

            expect(expectedState.errorMessage).toBeDefined("Invalid test - need error message");
            errorMessage = formDOM.find(ERRORMESSAGE);
            expect(errorMessage).toExist();
            expect(errorMessage.text()).toBe(expectedState.errorMessage);

        } else {

            expect(formDOM.find(PROSPECTERROR)).not.toExist();

            if (expectedState.loading) {
                expect(formDOM.find(PROSPECTVIEW)).not.toExist();
            } else {

                expect(formDOM.find(PROSPECTVIEW)).toExist();
                expect(name).toExist();
                expect(name.text()).toBe(expectedState.displayName);
                expect(picture).toExist();

                // Layer 3

                contactBar = formDOM.find(CONTACTBAR);

                expect(contactBar).toExist();

                // Layer 4

                expectedState.phoneNumbers.forEach(function (phone) {
                    var p = {
                        link: "tel:" + phone.number,
                        confidential: phone.confidential
                    };
                    if (phone.type) {
                        p.text = phone.type + ": " + phone.number;
                    } else {
                        p.text = phone.number;
                    }
                    phones.push(p);
                });
                checkContactInfo(formDOM, phones, expectedState.callMenuOpen, CALLBTN, CALLDROPDOWN, "[bb-frog-testid='callConfidential']");

                phones = [];
                expectedState.phoneNumbers.forEach(function (phone) {
                    var p = {
                        link: "sms:" + phone.number,
                        confidential: phone.confidential
                    };
                    if (phone.type) {
                        p.text = phone.type + ": " + phone.number;
                    } else {
                        p.text = phone.number;
                    }
                    phones.push(p);
                });
                checkContactInfo(formDOM, phones, expectedState.textMenuOpen, TEXTBTN, TEXTDROPDOWN, "[bb-frog-testid='textConfidential']");

                expectedState.emailAddresses.forEach(function (email) {
                    var e = {
                        link: "mailto:" + email.address
                    };
                    if (email.type) {
                        e.text = email.type + ": " + email.address;
                    } else {
                        e.text = email.address;
                    }
                    emails.push(e);
                });
                checkContactInfo(formDOM, emails, expectedState.emailMenuOpen, EMAILBTN, EMAILDROPDOWN);

            }

            if (expectedState.hasLabels) {
                expect(formDOM.find(PROSPECTLABELS)).toExist();

                // Layer 4

                if (expectedState.deceased) {
                    deceased = formDOM.find(DECEASED);
                    expect(deceased).toExist();
                    expect(deceased.text()).toBe("Deceased");
                }

                if (expectedState.inactive) {
                    inactive = formDOM.find(INACTIVE);
                    expect(inactive).toExist();
                    expect(inactive.text()).toBe("Inactive");
                }

            } else {
                expect(formDOM.find(PROSPECTLABELS)).not.toExist();
            }

            if (expectedState.hasBusiness) {
                expect(formDOM.find(PRIMARYBUSINESS)).toExist();

                // Layer 4

                if (expectedState.jobTitle) {
                    jobTitle = formDOM.find(JOBTITLE);
                    expect(jobTitle).toExist();
                    expect(jobTitle.text()).toBe(expectedState.jobTitle);
                } else {
                    expect(jobTitle).not.toExist();
                }

                expect(expectedState.businessName).toBeDefined("Invalid test - need business name");
                businessName = formDOM.find(PRIMARYBUSINESSNAME);
                expect(businessName).toExist();
                expect(businessName.text()).toBe(expectedState.businessName);

            } else {
                expect(formDOM.find(PRIMARYBUSINESS)).not.toExist();
            }

            if (expectedState.hasSpouse) {
                expect(formDOM.find(SPOUSE)).toExist();

                // Layer 4

                expect(expectedState.spouseName).toBeDefined("Invalid test - need spouse name");
                expect(expectedState.spouseId).toBeDefined("Invalid test - need spouse name");
                spouseName = formDOM.find(SPOUSENAME);
                expect(spouseName).toExist();
                spouseLink = spouseName.find("a");
                expect(spouseLink).toHaveAttr("href", "/wendy-hernandez-" + expectedState.spouseId);
                expect(spouseLink.text()).toBe(expectedState.spouseName);

                spouseDeceased = formDOM.find(SPOUSEDECEASED);
                if (expectedState.spouseDeceased) {
                    expect(spouseName).toHaveClass("pull-left");

                    expect(spouseDeceased).toExist();
                    expect(spouseDeceased.find("span").text()).toBe("Deceased");

                } else {
                    expect(spouseName).not.toHaveClass("pull-left");
                    expect(spouseDeceased).not.toExist();
                }

            } else {
                expect(formDOM.find(SPOUSE)).not.toExist();
            }

            if (expectedState.hasPrimaryMember) {
                expect(formDOM.find(PRIMARYMEMBER)).toExist();

                // Layer 4

                expect(expectedState.primaryMemberName).toBeDefined("Invalid test - need primary member name");
                expect(expectedState.primaryMemberId).toBeDefined("Invalid test - need primary member name");
                primaryMemberName = formDOM.find(PRIMARYMEMBERNAME);
                expect(primaryMemberName).toExist();
                primaryMemberLink = primaryMemberName.find("a");
                expect(primaryMemberLink).toHaveAttr("href", "/laura-holt-" + expectedState.primaryMemberId);
                expect(primaryMemberLink.text()).toBe(expectedState.primaryMemberName);

            } else {
                expect(formDOM.find(PRIMARYMEMBER)).not.toExist();
            }

            if (expectedState.hasProspectManager) {
                expect(formDOM.find(PROSPECTMANAGER)).toExist();

                // Layer 4

                expect(expectedState.prospectManagerName).toBeDefined("Invalid test - need prospect manager name");
                expect(expectedState.prospectManagerId).toBeDefined("Invalid test - need prospect manager name");
                prospectManagerName = formDOM.find(PROSPECTMANAGERNAME);
                expect(prospectManagerName).toExist();
                prospectManagerLink = prospectManagerName.find("a");
                expect(prospectManagerLink).toHaveAttr("href", "/henry-higgins-" + expectedState.prospectManagerId);
                expect(prospectManagerLink.text()).toBe(expectedState.prospectManagerName);

            } else {
                expect(formDOM.find(PROSPECTMANAGER)).not.toExist();
            }

            checkNextStep(formDOM, expectedState);

        }

    }

    beforeEach(function () {

        module("bbui.shellservice");
        module(function ($provide) {
            var bbuiShellService = {
                create: function () {
                    return {
                        securityUserGrantedFeature: function () {
                            return $q.resolve({
                                data: {
                                    granted: true
                                }
                            });
                        }
                    };
                }
            };

            $provide.value('bbuiShellService', bbuiShellService);

        });

        module("frog.test");
        module("frog");

    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _$q_, _frogResources_, _slug_, _testUtils_, _bbMoment_, _mapping_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $q = _$q_;
        $scope.resources = _frogResources_;
        $scope.mapping = _mapping_;
        slug = _slug_;
        testUtils = _testUtils_;
        bbMoment = _bbMoment_;
    }));

    beforeEach(function () {

        state = {
            getProspectLink: getProspectLink,
            prospect: {
                displayName: "Dr. Robert Hernandez, Class of 1990"
            }
        };

    });

    describe('prospect view html', function () {

        it('displays correctly when the minimum information is set', function () {

            var formDOM;

            state.prospect.displayName = "robert hernandez";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "robert hernandez"
            });

            $scope.prospectPage.prospect = {
                displayName: "Dr. Robert Hernandez, Class of 1990"
            };

            $rootScope.$digest();

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990"
            });

        });

        it('displays correctly when all information is set', function () {

            var formDOM;

            state.prospect.deceased = true;
            state.prospect.inactive = true;
            state.prospect.phoneNumbers = [
                {
                    number: "843-555-1234"
                },
                {
                    number: "843-555-5678",
                    type: "Home",
                    confidential: true
                }
            ];
            state.prospect.emailAddresses = [
                {
                    address: "bob.hernandez@blackbaud.com"
                },
                {
                    address: "bob.hernandez@gmail.com",
                    type: "Home"
                }
            ];
            state.prospect.primaryBusinessName = "Barkbaud";
            state.prospect.jobTitle = "CEO";
            state.prospect.spouseName = "Wendy Hernandez";
            state.prospect.spouseId = "1234";
            state.prospect.spouseDeceased = true;
            state.prospect.nextStepContactMethod = "Meeting";
            state.prospect.nextStepObjective = "Meeting to discuss proposal";
            state.prospect.nextStepLocation = "93 Elm St, Gettysburg PA 17325";
            state.prospect.nextStep = "Today";
            state.prospect.nextStepLabelClass = "label-warning";
            state.prospect.nextStepTime = "11:00 AM";
            state.prospect.nextStepComments = "Comments";
            state.prospect.nextStepPlanName = "My Plan Name";
            state.prospect.prospectManagerId = "43EED8CB-8A0E-4BEA-85E1-72005D574EEC";
            state.prospect.prospectManagerName = "Henry Higgins";
            state.prospect.primaryMemberId = "5678";
            state.prospect.primaryMemberName = "Laura Holt";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers,
                emailAddresses: state.prospect.emailAddresses,
                hasLabels: true,
                deceased: true,
                inactive: true,
                hasBusiness: true,
                businessName: "Barkbaud",
                jobTitle: "CEO",
                hasSpouse: true,
                spouseName: "Wendy Hernandez",
                spouseId: "1234",
                spouseDeceased: true,
                hasNextStep: true,
                nextStepContactMethod: state.prospect.nextStepContactMethod,
                nextStepObjective: state.prospect.nextStepObjective,
                nextStepLocation: state.prospect.nextStepLocation,
                nextStep: state.prospect.nextStep,
                nextStepLabelClass: state.prospect.nextStepLabelClass,
                nextStepTime: state.prospect.nextStepTime,
                nextStepComments: state.prospect.nextStepComments,
                nextStepPlanName: state.prospect.nextStepPlanName,
                hasProspectManager: true,
                prospectManagerName: "Henry Higgins",
                prospectManagerId: "43EED8CB-8A0E-4BEA-85E1-72005D574EEC",
                hasPrimaryMember: true,
                primaryMemberId: "5678",
                primaryMemberName: "Laura Holt"

            });

        });

        it('displays correctly when error exists', function () {

            var formDOM;

            state.prospect.displayName = "robert hernandez";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                hasError: false,
                displayName: "robert hernandez"
            });

            $scope.prospectPage.loadError = "Test error 1";

            $rootScope.$digest();

            checkState(formDOM, {
                hasError: true,
                errorMessage: "Test error 1",
                displayName: "robert hernandez"
            });

        });

        it('displays correctly when loading', function () {

            var formDOM;

            state.loading = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                loading: true
            });

        });

        it('displays correctly when prospect has phone numbers', function () {

            var formDOM;

            state.prospect.phoneNumbers = [
                {
                    number: "843-555-1234"
                },
                {
                    number: "843-555-5678",
                    type: "Home",
                    confidential: true
                },
                {
                    number: "843-555-0000",
                    type: "Work"
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers
            });

        });

        it('displays correctly when prospect has email addresses', function () {

            var formDOM;

            state.prospect.emailAddresses = [
                {
                    address: "bob.hernandez@blackbaud.com"
                },
                {
                    address: "bob.hernandez@gmail.com",
                    type: "Home"
                }
            ];
            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                emailAddresses: state.prospect.emailAddresses
            });

        });

        it('displays the contact dropdowns when the contact buttons are clicked', function () {

            var formDOM;

            state.prospect.phoneNumbers = [
                {
                    number: "843-555-1234"
                },
                {
                    number: "843-555-5678",
                    type: "Home",
                    confidential: true
                }
            ];
            state.prospect.emailAddresses = [
                {
                    address: "bob.hernandez@blackbaud.com"
                },
                {
                    address: "bob.hernandez@gmail.com",
                    type: "Home"
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers,
                emailAddresses: state.prospect.emailAddresses
            });

            formDOM.find(CALLBTN).click();
            $rootScope.$digest();

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers,
                emailAddresses: state.prospect.emailAddresses,
                callMenuOpen: true
            });

            formDOM.find(TEXTBTN).click();
            $rootScope.$digest();

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers,
                emailAddresses: state.prospect.emailAddresses,
                textMenuOpen: true
            });

            formDOM.find(EMAILBTN).click();
            $rootScope.$digest();

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                phoneNumbers: state.prospect.phoneNumbers,
                emailAddresses: state.prospect.emailAddresses,
                emailMenuOpen: true
            });

        });

        it('displays correctly when prospect is deceased', function () {

            var formDOM;

            state.prospect.deceased = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasLabels: true,
                deceased: true
            });

        });

        it('displays correctly when prospect is inactive', function () {

            var formDOM;

            state.prospect.inactive = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasLabels: true,
                inactive: true
            });

        });

        it('displays correctly when prospect has a primary business', function () {

            var formDOM;

            state.prospect.primaryBusinessName = "Barkbaud";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasBusiness: true,
                businessName: "Barkbaud"
            });

        });

        it('displays correctly when prospect has primary employment', function () {

            var formDOM;

            state.prospect.primaryBusinessName = "Barkbaud";
            state.prospect.jobTitle = "CEO";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasBusiness: true,
                businessName: "Barkbaud",
                jobTitle: "CEO"
            });

        });

        it('displays correctly when prospect has a spouse', function () {

            var formDOM;

            state.prospect.spouseName = "Wendy Hernandez";
            state.prospect.spouseId = "1234";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasSpouse: true,
                spouseName: "Wendy Hernandez",
                spouseId: "1234"
            });

        });

        it('displays correctly when prospect has a deceased spouse', function () {

            var formDOM;

            state.prospect.spouseName = "Wendy Hernandez";
            state.prospect.spouseId = "1234";
            state.prospect.spouseDeceased = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasSpouse: true,
                spouseName: "Wendy Hernandez",
                spouseId: "1234",
                spouseDeceased: true
            });

        });

        it('displays correctly when prospect has a prospect manager', function () {

            var formDOM;

            state.prospect.prospectManagerName = "Henry Higgins";
            state.prospect.prospectManagerId = "43EED8CB-8A0E-4BEA-85E1-72005D574EEC";
            
            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasProspectManager: true,
                prospectManagerName: "Henry Higgins",
                prospectManagerId: "43EED8CB-8A0E-4BEA-85E1-72005D574EEC"
            });

        });

        it('displays correctly when prospect has a primary member', function () {

            var formDOM;

            state.prospect.primaryMemberName = "Laura Holt";
            state.prospect.primaryMemberId = "5678";

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                hasPrimaryMember: true,
                primaryMemberName: "Laura Holt",
                primaryMemberId: "5678"
            });

        });

        describe('next step', function () {

            it("displays correctly when there is no next step", function () {

                var formDOM;

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    displayName: "Dr. Robert Hernandez, Class of 1990",
                    hasNextStep: false
                });

            });

            it("displays correctly when there is a next step with minimal information", function () {

                var formDOM;

                state.prospect.nextStepObjective = "Meeting to discuss proposal";
                state.prospect.nextStep = bbMoment().format("l");

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    displayName: "Dr. Robert Hernandez, Class of 1990",
                    hasNextStep: true,
                    nextStepObjective: state.prospect.nextStepObjective,
                    nextStep: state.prospect.nextStep
                });

            });

            it("displays correctly when there is a next step with all information", function () {

                var formDOM;

                state.prospect.nextStepObjective = "Meeting to discuss proposal";
                state.prospect.nextStep = "Today";
                state.prospect.nextStepContactMethod = "Meeting";
                state.prospect.nextStepLocation = "2000 Daniel Island Drive";
                state.prospect.nextStepLabelClass = "label-warning";
                state.prospect.nextStepTime = "2:00 PM";

                formDOM = compileFormWithState(state);

                checkState(formDOM, {
                    displayName: "Dr. Robert Hernandez, Class of 1990",
                    hasNextStep: true,
                    nextStepObjective: state.prospect.nextStepObjective,
                    nextStep: state.prospect.nextStep,
                    nextStepContactMethod: state.prospect.nextStepContactMethod,
                    nextStepLocation: state.prospect.nextStepLocation,
                    nextStepLabelClass: state.prospect.nextStepLabelClass,
                    nextStepTime: state.prospect.nextStepTime
                });

            });

        });

    });

}());
