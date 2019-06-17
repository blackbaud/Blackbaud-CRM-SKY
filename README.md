# blackbaud-crm-sky
A repository containing the code needed to extend Blackbaud CRM's Fundraiser on the Go SKY-based mobile app.

## Deployment instructions

Follow these instructions to enable your development machine to create and extend Blackbaud SKY-based mobile apps.

### Install prerequisites

1. Install [nodeJS 6.10.0](https://nodejs.org/dist/v6.10.0/), leaving all options as the default.
2. Edit `npmrc` to change node to be global instead of per user.
    1. Go to `C:\Program Files\nodejs\node_modules\npm\npmrc`.
    2. Edit `npmrc` to read `prefix=c:\nodejs`.
3. From a Windows command prompt with Administrator rights, run the following command. This sets the npm cache to a location that is available for all users.

    `npm config set cache C:\npmcache --global`

    **Note**: Keep this command prompt window open. We will be using it multiple times.

4. Access the Advanced System Properties dialog and select Environment Variables.
5. If the directory exists, add `C:\Program Files\nodejs` to the User PATH environment variable. Otherwise, use `C:\nodejs`. Additionally, add `C:\nodejs` to the System PATH variable.
6. Update `npm` by running the following command.

    `npm update -g npm`

7. Install Grunt by running the following command. The command prompt will display a progress bar and then let you know it's completed.

    `npm install -g grunt-cli`

8. Install [Git 2.12.0.windows.1](https://github.com/git-for-windows/git/releases/tag/v2.12.0.windows.1), leaving all options as the default. Git is a source control used by different parts of our product.
9. Install Bower. Bower is a package manager for various frameworks including Javascript. Like Grunt, Bower will show a progress bar and then notify you when it completes.

    `npm install -g bower`

10. Open the Git command prompt, found in the Windows Start Menu and run the following command. This configures Git to allow long file paths.

    `git config --global core.longpaths true`

    **Note**: This is necessary because Bower uses the temp directory to store the packages before removing ignored files, and there can be files that are too long for Windows that cause the build to fail.

11. Restart so the environment variables are set for the build. Logging out does not work.

### Build Fundraiser on the Go

1. Install CRM using a Blackbaud-issued installer.
2. Modify `web.config` to search for custom directories. The default is `bin\custom`.
3. Download Fundraiser on the Go code from the [Blackbaud Community GitHub](https://github.com/blackbaud-community/Blackbaud-CRM-SKY).
4. Build `Blackback.CustomFx.Frog.Catalog` and `Blackbaud.CustomFx.SkyUI` and place the DLLs in the custom folder within your virtual directory.
5. Open `gruntfile.js` in the Mobile.Sky directory and modify the `vroot` variable to your local installation's virtual directory root.
6. Open an administrator command prompt and run the following series of commands:

    `npm install`

    `bower install`
    
    `grunt buildcustom`

7. Access installation by navigating to: &#60;application root&#62;/browser/htmlforms/custom/frogger&databaseName=BBInfinity