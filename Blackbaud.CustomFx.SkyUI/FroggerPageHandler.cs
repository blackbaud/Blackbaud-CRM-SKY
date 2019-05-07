namespace Blackbaud.CustomFx.SkyUI
{
    /// <summary>
    /// This handler routes HTML5 URLs to the home page of a custom application.
    /// </summary>
    public class FroggerPageHandler : SkyPageHandler
    {
        /// <summary>
        /// Gets a value indiciating whether or not this is associated with a custom application.
        /// </summary>
        public override bool IsCustomApp
        {
            get { return true; }
        }

        /// <summary>
        /// Gets the name of the application's root folder on the local drive.
        /// </summary>
        public override string AppRootFolder
        {
            get { return "frogger"; }
        }
    }
}
