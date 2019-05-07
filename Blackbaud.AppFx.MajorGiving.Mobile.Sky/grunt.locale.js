/*global module */
module.exports = function (grunt, env, utils) {
    'use strict';

    // Generate our JS config for each supported locale
    grunt.registerTask('l10n', function () {

        var RESOURCES_PREFIX = 'resources_',
            SKYOVERRIDES_RESOURCES_PREFIX = 'skyoverrides_resources_',
            pathLocales = grunt.config.get('frog.paths.locales'),
            pathDist = grunt.config.get('buildPath'),
            template = grunt.file.read(pathLocales + 'template.js'),
            options = {
                filter: 'isFile',
                cwd: '.'
            };

        grunt.file.expand(options, pathLocales + RESOURCES_PREFIX + '*').forEach(function (path) {
            var destFile,
                fileName,
                tmp,
                js,
                locale,
                overridesPath,
                p,
                parts = path.split('/'),
                stringsIn,
                stringsOut = {};

            fileName = parts[parts.length - 1];

            // Before restructuring the resource files we used a different file name format, so we are jumping
            // through some hoops here to maintain the previous file name format for backwards compatibility.
            locale = fileName
                .substring(RESOURCES_PREFIX.length, fileName.length - 5); // Remove resources_ prefix and file extension ('.json')

            overridesPath = pathLocales + SKYOVERRIDES_RESOURCES_PREFIX + locale + '.json';

            locale = locale.replace(/_/g, '-');

            stringsIn = grunt.file.readJSON(path);

            for (p in stringsIn) {
                if (stringsIn.hasOwnProperty(p)) {
                    stringsOut[p] = stringsIn[p].message;
                }
            }

            tmp = 'frogResourcesOverrides = ' + JSON.stringify(stringsOut) + ';';
            js = template.replace('/*LOCALEJSON*/', tmp);

            if (grunt.file.exists(overridesPath)) {
                stringsOut = {};
                stringsIn = grunt.file.readJSON(overridesPath);

                for (p in stringsIn) {
                    if (stringsIn.hasOwnProperty(p)) {
                        stringsOut[p] = stringsIn[p].message;
                    }
                }

                tmp = 'skyResourcesOverrides = ' + JSON.stringify(stringsOut) + ';';
                js = js.replace('/*LOCALEOVERRIDEJSON*/', tmp);

            }

            destFile = pathDist + '/js/locales/frog-locale-' + locale + '.js';

            grunt.file.write(destFile, js);
            utils.log('File "' + destFile + '" created.');
        });
    });
};