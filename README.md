# blackbaud-crm-sky

A repository containing the code needed to extend Blackbaud CRM's Fundraiser on the Go SKY-based mobile app.

## Table of contents
- [Development instructions](#development-instructions)
    + [Install prerequisites](#install-prerequisites)
    + [Build Fundraiser on the Go](#build-fundraiser-on-the-go)
- [Customization instructions](#customization-instructions)
    + [Infinity components](#infinity-components)
    + [API endpoints](#api-endpoints)
    + [Javascript controllers](#javascript-controllers)
    + [HTML elements](#html-elements)
- [Deployment instructions](#deployment-instructions)
    + [On-premise clients](#on-premise-clients)
    + [Hosted clients](#hosted-clients)
- [Resources](#resources)

## Development instructions

Follow these instructions to enable your development machine to create and extend Blackbaud SKY-based mobile apps.

### Install prerequisites

1. Install [nodeJS 6.10.0](https://nodejs.org/dist/v6.10.0/), leaving all options as the default.
1. Edit `npmrc` to change node to be global instead of per user.
    1. Go to `C:\Program Files\nodejs\node_modules\npm\npmrc`.
    1. Edit `npmrc` to read `prefix=c:\nodejs`.
1. From a Windows command prompt with Administrator rights, run the following command. This sets the npm cache to a location that is available for all users.

    `npm config set cache C:\npmcache --global`

    **Note**: Keep this command prompt window open. We will be using it multiple times.

1. Access the Advanced System Properties dialog and select Environment Variables.
1. If the directory exists, add `C:\Program Files\nodejs` to the User PATH environment variable. Otherwise, use `C:\nodejs`. Additionally, add `C:\nodejs` to the System PATH variable.
1. Update `npm` by running the following command.

    `npm update -g npm`

1. Install Grunt by running the following command. The command prompt will display a progress bar and then let you know it's completed.

    `npm install -g grunt-cli`

1. Install [Git 2.12.0.windows.1](https://github.com/git-for-windows/git/releases/tag/v2.12.0.windows.1), leaving all options as the default. Git is a source control used by different parts of our product.
1. Install Bower. Bower is a package manager for various frameworks including Javascript. Like Grunt, Bower will show a progress bar and then notify you when it completes.

    `npm install -g bower`

1. Open the Git command prompt, found in the Windows Start Menu and run the following command. This configures Git to allow long file paths.

    `git config --global core.longpaths true`

    **Note**: This is necessary because Bower uses the temp directory to store the packages before removing ignored files, and there can be files that are too long for Windows that cause the build to fail.

1. Restart so the environment variables are set for the build. Logging out does not work.

### Build Fundraiser on the Go

1. Install CRM using a Blackbaud-issued installer.
1. Modify `web.config` to search for custom directories. The default is `bin\custom`.
1. Download Fundraiser on the Go code from the [Blackbaud Community GitHub](https://github.com/blackbaud-community/Blackbaud-CRM-SKY).
1. Build `Blackbaud.CustomFx.Frog.Catalog` and `Blackbaud.CustomFx.SkyUI` and place the DLLs in the custom folder within your virtual directory.
1. Open `gruntfile.js` in the `Blackbaud.AppFx.MajorGiving.Mobile.Sky` directory and modify the `vroot` variable to your local installation's virtual directory root.
1. Open `crm.custom.js` in the `Blackbaud.AppFx.MajorGiving.Mobile.Sky\src\api` directory and modify the methods there to the versions below. This flips a software switch that will enable the code to function as a stand-alone custom installation rather than the out-of-box version that we build.

    ``` javascript
    getRootFolder: function () {
        return 'frogger';
    }
    ```

    ``` javascript
    isCustomApp: function () {
        return true;
    }
    ```
1. Open an administrator command prompt and run the following series of commands:

    ```
    npm install
    bower install
    grunt buildcustom
    ```
    
    **Note**: It is not recommended to run `grunt build`, even though it is a registered task with Grunt. This will irreversibly overwrite your out-of-box Fundraiser on the Go instance.

1. Access installation by navigating to: https://&#60;application root&#62;/browser/htmlforms/custom/frogger/&databaseName=BBInfinity
1. To rebuild and redeploy the code after making changes, simply re-run `grunt buildcustom` from an administrator command prompt.

    **Note**: Depending on what changes you make in your local development environment, it's possible that code in deleted files could still be deployed in your test builds. This is because the `/build` and `/tmp` folders in the `Blackbaud.AppFx.MajorGiving.Mobile.Sky` directory still contain these files if they were present in a previous build. To ensure you are deploying the most recent version of the code in your local workspace, delete these folders, then run `grunt buildcustom` from an administrator command prompt.

## Customization instructions

The following sections are a primer to help you understand the different components of Fundraiser on the Go and some basic ways that they can be customized or extended. This is by no means a comprehensive guide.

### Infinity components

Behind Fundraiser on the Go is a variety of standard Infinity components, such as `DataList`s, `SearchList`s, and `DataForm`s like those with which many developers are accustomed. These components allow Fundraiser on the Go to interact with the CRM web server and database. We did not open source that part of the code, but you will see references to many of these components baked in to the javascript, particularly in the `frog.api` module.

We have included an empty catalog for you to use to house any custom Infinity components you may need to support your extensions. Simply place them in `Blackbaud.CustomFx.Frog.Catalog` like you would any other spec. They still need to be loaded into the database via `LoadSpec`, compiled, and sent to the virtual directory using Visual Studio.

### API endpoints

Once you have added any custom Infinity components, you will need a way for Fundraiser on the Go to interact with them. You'll find these API calls in `Blackbaud.AppFx.MajorGiving.Mobile.Sky`'s `src/api` folder. We've organized different API calls by function to make the collection more manageable.

There are many places, especially in javascript controllers, in which the default behavior can be overridden. To specify such a method or property, you must add it to `crm.customizable.js`. This factory, a part of the main `frog.api` module, is available everywhere the API is available. Here, add the properties or methods you wish to use and specify their default behavior. We'll override it in another file.

``` javascript
yourFunctionName: function() {
    // Out of box code for your function
}
```

Once that is complete, turn your attention to `crm.custom.js`. Specify a method or property with the same name and signature as before, but this time define the custom behavior you wish it to have. Now, you can call this method from anywhere that the API is available simply by invoking:

``` javascript
customizable.yourFunctionName();
```

We built it this way to make application-wide functionality easier to manage. For example, one change in `crm.custom.js` to call the method found in `crm.customizable.js` instantly reverts all references to it to use standard behavior.

### Javascript controllers

Found in the `Blackbaud.AppFx.MajorGiving.Mobile.Sky` solution in the `src/views` folder, these javascript components provide a bridge between your CRM installation and the HTML-based Fundraiser on the Go UI. These controllers are analogous to `UIModel` event handler classes found in conventional Infinity development in that they control the behavior of the component that it represents. This time, the code is executed in the client browser rather than on the web server.

It is possible to override functions within our controllers or to create your own controller entirely. Typically, objects that are to be displayed in the UI (or those that influence how those objects are displayed) are stored in the `locals` variable within the controller. They can then be referenced in the corresponding HTML by referencing `locals.objectName`.

### HTML elements

Found in the code base alongside their respective controllers, HTML views dictate layout and, to some degree, behavior of the UI. Here, you can use a mix of HTML and Angular to build your UI, using components made available in the controller behind it. In the code, you will find HTML forms of varying complexities, as well as several different types of controls that are made available via the SKY UX framework. For more information on what controls are available, please visit the Blackbaud AngularJS (1.x) documentation page, linked below.

## Deployment instructions

Follow these instructions to deploy your finished product into staging or production environments.

### On-premise clients

Deploying customized Fundraiser on the Go code is very similar to current processes. Just follow these steps below.

1. Deploy Infinity specs using a `PackageSpec`. For more information, consult the [Infinity SDK Guide](https://www.blackbaud.com/files/support/guides/infinitydevguide/infsdk-developer-help.htm).
1. Deploy the latest versions of the `Blackbaud.CustomFx.Frog.Catalog` and `Blackbaud.CustomFx.SkyUI` DLLs to the custom folder within your virtual directory. Some customizations will require changes to these assemblies.
1. Deploy the compiled Fundraiser on the Go code, found within the `/build` folder, to the `browser/htmlforms/custom/frogger/` folder within your virtual directory.
1. Reset your web server.

### Hosted clients

Please contact Blackbaud to get your finished product deployed. We will use the same process that we currently use for standard Infinity customizations.

## Resources

[Blackbaud AngularJS (1.x) documentation](https://skyux.developer.blackbaud.com/)

Fundraiser on the Go is built on SKY UX 1, which uses AngularJS 1. Here, you'll find helpful documentation that will show what controls and functions are available through the framework as well as design standards and recommended best practices.