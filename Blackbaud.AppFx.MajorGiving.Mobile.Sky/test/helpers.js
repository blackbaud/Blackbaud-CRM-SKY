/*jshint jasmine: true */
/*globals angular, $ */

(function () {
    'use strict';

    angular.module("frog.test", [])
    .factory("testUtils", [function () {

        /**
         * @private
         * Check all links for correctness.
         *
         * This checks that any links are not vulnerable to phishing attacks as described by this [post](http://nullreference.blackbaud.com/questions/do-i-need-to-do-anything-anything-to-protect-links-that-target-a-blank-browser-window-da70d882-730d-42a3-9f90-405199a42b72).
         */
        function checkLinks(formDOM) {

            var links = formDOM.find("a"),
                link,
                i;

            if (links) {
                for (i = 0; i < links.length; ++i) {
                    link = $(links[i]);
                    if (link.attr("target") === "_blank") {
                        expect(link).toHaveAttr("rel", "noopener noreferrer", "Links that open in a new window without this attribute are vulnerable to phishing attacks.");
                    }
                }
            }

        }

        /**
         * Ensure that a field is marked required or not.
         *
         * @param {Boolean} required
         * @param {Object} formDOM
         * @param {Object} field
         */
        function checkFieldRequired(required, formDOM, field) {

            var fieldName,
                labelField;

            fieldName = field.attr("name");
            expect(fieldName).toBeDefined("fieldName");
            expect(fieldName.length).not.toEqual(0, "fieldName");

            labelField = formDOM.find("[for='" + fieldName + "']");
            expect(labelField).toExist();

            if (required) {
                expect(field).toHaveAttr("required", "required");
                expect(labelField).toHaveClass("required");
            } else {
                expect(field).not.toHaveAttr("required", "required");
                expect(labelField).not.toHaveClass("required");
            }

        }

        /**
         * Check that the indicated field is the only field that is auto-focused.
         *
         * @param {Object} formDOM
         * @param {Object} fieldToFocus
         */
        function checkAutofocus(formDOM, fieldToFocus) {

            var autofocusFields = formDOM.find("[autofocus]");

            expect(fieldToFocus).toHaveAttr("autofocus");

            expect(autofocusFields.length).toBe(1, "A single field should have the autofocus attribute.");

        }

        return {

            /**
             * Check general rules for the HTML.
             * This checks things that are basic rules such as ensuring that links that open in a new window are secure.
             */
            checkHtml: function (formDOM) {
                checkLinks(formDOM);
            },

            checkFieldRequired: checkFieldRequired,
            checkAutofocus: checkAutofocus

        };

    }]);

}());
