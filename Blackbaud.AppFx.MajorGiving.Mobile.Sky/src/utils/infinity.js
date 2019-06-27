/*jshint browser: true */
/*global angular */

(function () {
    'use strict';

    var euc = encodeURIComponent;

    angular.module("frog.util")
    .factory("infinityUtilities", ["mockableUtilities", "bbMoment", function (mockableUtilities, bbMoment) {

        /**
         * Gets the virtual directory name.
         *
         * @return {String}
         */
        function getVirtualDirectory() {

            var parser,
                path;

            parser = document.createElement('a');
            parser.href = mockableUtilities.getWindowLocation().href;

            path = parser.pathname; // i.e. /bbappfx/sky/frog/index.html

            path = path.substring(0, path.indexOf("/sky/frog"));

            if (path[0] === "/") {
                path = path.substring(1);
            }

            return path;

        }

        /**
         * Get the Infinity login URL.
         *
         * @param {String} databaseName
         */
        function getWebShellLoginUrl(databaseName, status) {

            var url,
                redirectUrl = mockableUtilities.getWindowLocation().href;

            url = "/" + getVirtualDirectory() + "/webui/WebShellLogin.aspx?databaseName=" + euc(databaseName);

            // TODO CEV
            //if (BBUI.globals._auth.useADcredentials) {
            //    url += "&useADcredentials=true";
            //}

            url += "&url=" + euc(redirectUrl);

            if (status) {
                url += "&status=" + euc(status);
            }

            return url;
        }

        /**
         * Convert a Blackbaud.AppFx.HourMinute to a readable string.
         *
         * @param {String} hourMinute
         *
         * @return {String}
         * The formatted time, such as "2:00 PM".
         */
        function convertHourMinute(hourMinute) {

            var result = "",
                time,
                hour,
                minute;

            if (hourMinute && typeof hourMinute === "string" &&
                hourMinute.length === 4 && hourMinute !== "    ") {

                hour = parseInt(hourMinute.substring(0, 2));
                minute = parseInt(hourMinute.substring(2, 4));

                time = bbMoment({ hour: hour, minute: minute });
                result = time.format("LT");

            }

            return result;

        }

        return {
            getVirtualDirectory: getVirtualDirectory,
            getWebShellLoginUrl: getWebShellLoginUrl,
            convertHourMinute: convertHourMinute
        };

    }]);

}());