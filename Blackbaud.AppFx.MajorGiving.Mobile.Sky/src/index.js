/*jshint browser: true */
/*globals jQuery */

(function ($) {
    'use strict';

    // Google Fonts don't work too well when IE is reporting a browser version of 7 which it does even when
    // the X-UA-Compatible meta tag is used to force IE into standards mode.  This fixes it.
    if (navigator.userAgent.indexOf('Trident/7.0') >= 0) {
        $('head').append(
            '<link href="http://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">' +
            '<link href="http://fonts.googleapis.com/css?family=Open+Sans:400" rel="stylesheet" type="text/css">' +
            '<link href="http://fonts.googleapis.com/css?family=Open+Sans:700" rel="stylesheet" type="text/css">' +
            '<link href="http://fonts.googleapis.com/css?family=Oswald:300" rel="stylesheet" type="text/css">' +
            '<link href="http://fonts.googleapis.com/css?family=Oswald:400" rel="stylesheet" type="text/css">' +
            '<link href="http://fonts.googleapis.com/css?family=Oswald:700" rel="stylesheet" type="text/css">'
        );
    }

}(jQuery));
