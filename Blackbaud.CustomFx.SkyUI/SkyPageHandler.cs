using Blackbaud.AppFx.Server.ClaimsAuthentication;
using Blackbaud.AppFx.WebShell;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Web;

namespace Blackbaud.CustomFx.SkyUI
{
    /// <summary>
    /// This handler routes HTML5 URLs to the home page.
    /// </summary>
    public abstract class SkyPageHandler : IHttpHandler
    {
        /// <summary>
        /// Gets a value indicating whether another request can use this instance.
        /// </summary>
        public bool IsReusable
        {
            get
            {
                // There is no internal state in this class, so an instance is safe to re-use.
                return true;
            }
        }

        /// <summary>
        /// Gets a value indiciating whether or not this is associated with a custom application.
        /// </summary>
        public abstract bool IsCustomApp { get; }

        /// <summary>
        /// Gets the name of the application's root folder on the local drive.
        /// </summary>
        public abstract string AppRootFolder { get; }

        private string GetAppFolder()
        {
            if (IsCustomApp)
            {
                return string.Format(CultureInfo.InvariantCulture, "/browser/htmlforms/custom/{0}", AppRootFolder);
            }
            else
            {
                return string.Format(CultureInfo.InvariantCulture, "/sky/{0}", AppRootFolder);
            }
        }

        /// <summary>
        /// Processes the HTTP web request.
        /// </summary>
        /// <param name="context"></param>
        public void ProcessRequest(HttpContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }

            // Handle federated authentication
            string databaseName = RequestContextUtility.UrlDecodeDatabaseName(context.Request.QueryString["databasename"]);
            WSFederationSystemStatus wsFederationStatus = WSFederation.get_WSFederationStatus(context, databaseName);

            List<string> properties = new List<string>();

            if (wsFederationStatus.RequestUsesWSFederation)
            {
                // Request is already claims authenticated
                properties.Add("wsFederationLoginRequired: false");
            }
            else
            {
                // Request is not claims authenticated
                properties.Add("wsFederationLoginRequired: true");
            }

            if (wsFederationStatus.WSFederationEnabled)
            {
                properties.Add("wsFederationEnabled: true");
            }
            else
            {
                properties.Add("wsFederationEnabled: false");
            }

            StringBuilder authGlobals = new StringBuilder();
            authGlobals.Append("auth = { ");
            authGlobals.Append(string.Join(", ", properties));
            authGlobals.Append(" };");
            context.Response.Write("<script type='text/javascript'>" + authGlobals.ToString() + "</script>");

            // Rewrite the URL for HTML5 mode.

            string appFolder = GetAppFolder();

            if (context.Request.FilePath.EndsWith(appFolder, StringComparison.OrdinalIgnoreCase))
            {
                /* When the URL contains no trailing slash AND a query string, IIS does not redirect
                 * appropriately, AngularJS has a javascript error, and the page will fail to load.
                 * 
                 * Redirect to the same URL but with the trailing slash.
                 * 
                 * This was tested with fragments (#) and the fragments are preserved upon redirect.
                 */

                Uri url = context.Request.Url;
                string redirect = String.Format(CultureInfo.InvariantCulture, "{0}/{1}", url.GetLeftPart(UriPartial.Path), url.Query);
                context.Response.Redirect(redirect);
            }
            else
            {
                context.Response.WriteFile(context.Request.ApplicationPath + appFolder + "/index.html");
            }
        }
    }
}
