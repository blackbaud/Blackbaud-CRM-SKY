# Create a record page

<p>Now that you've learned how to get a <a href="../start-a-project">SKY UX app up and running</a>, and you can <a href="../authentication">authenticate with CRM</a>, let's build a page with some content. SKY UX applications feature two common page types: record pages and tabbed pages.</p>

<p>Record pages usually display information about specific records in two distinct sections: a summary section and a tiles section.</p>

## Summary section

### Static

<p>The summary section resides at the top of the page to provide a general overview of a record. For example, it can display information such as a record name, description, and profile picture. To add a summary section to your page, use the <a href="http://skyux.developer.blackbaud.com/components/pagesummary">page summary directive</a>. </p>

<pre><code class="language-markup">&lt;bb-page-summary>
  &lt;bb-page-summary-image>
    &lt;bb-avatar
      bb-avatar-src="'http://skyux.developer.blackbaud.com/assets/img/hernandez.jpg'">
    &lt;/bb-avatar>
  &lt;/bb-page-summary-image>
  &lt;bb-page-summary-title>
    Robert Hernandez
  &lt;/bb-page-summary-title>
  &lt;bb-page-summary-subtitle>
    CEO, Barkbaud, Inc.
  &lt;/bb-page-summary-subtitle>
  &lt;bb-page-summary-content>
    Robert Hernandez is an important member of our organization.
  &lt;/bb-page-summary-content>
&lt;/bb-page-summary>
</code></pre>

### Dynamic

These hard-coded values for Robert Hernandez aren't going to be very useful. You want to be able to pull these values from your service dynamically.

Add a controller with the information about Robert to your Angular module:

<pre><code>  angular.module('skytutorial')
  .controller('ConstituentController', [function () {

    return {
      constituent: {
        name: "Robert Hernandez",
        title: "CEO",
        company: "Barkbaud, Inc.",
        alert: "Robert Hernandez is an important member of our organization."
      }
    };

  }]);</code></pre>

Set the controller on a `div` tag and pull the page values from the controller:

<pre><code>  &lt;div ng-controller="ConstituentController as constitCtrl">
    &lt;bb-page-summary>
      &lt;bb-page-summary-image>
        &lt;bb-avatar
          bb-avatar-src="'http://skyux.developer.blackbaud.com/assets/img/hernandez.jpg'">
        &lt;/bb-avatar>
      &lt;/bb-page-summary-image>
      &lt;bb-page-summary-title>
        {{constitCtrl.constituent.name}}
      &lt;/bb-page-summary-title>
      &lt;bb-page-summary-subtitle>
        {{constitCtrl.constituent.title}}, {{constitCtrl.constituent.company}}
      &lt;/bb-page-summary-subtitle>
      &lt;bb-page-summary-content>
        {{constitCtrl.constituent.alert}}
      &lt;/bb-page-summary-content>
    &lt;/bb-page-summary>
  &lt;div></code></pre>

The content in the `{{brackets}}` is pulled from your Angular service.

### From Blackbaud CRM

Change your Angular service to pull the constituent information from Blackbaud CRM. In this case, we are pulling data from two different data forms. Some of the information in this example is still hard-coded, but you get the idea. When making a real app, you won't be hard-coding the constituent ID either, you'll more likely be linking to a constituent page from a list or search.

<pre><code>
    angular.module('skytutorial')
    .controller('ConstituentController', ['bbuiShellService', '$scope', '$q', function (bbuiShellService, $scope, $q) {

        var self = this,
            svc = bbuiShellService.create(),
            CONSTITUENT_ID = "d445a2c7-f7df-447c-9fb9-c946541cc8b9",
            RELATIONSHIPTILE_ID = "4C7CB597-8DAF-40B0-8DCA-01D632364702",
            CONSTITUENTNAME_VIEW_ID = "3BC0BA15-6BF2-4c6d-A687-56B350A983FE",
            constituent = {
                title: "CEO",
                alert: "Robert Hernandez is an important member of our organization."
            };

        $scope.loading = true;

        function getConstituentAsync() {

            $q.all([
                svc.dataFormLoad(CONSTITUENTNAME_VIEW_ID, {
                    recordId: CONSTITUENT_ID
                }),
                svc.dataFormLoad(RELATIONSHIPTILE_ID, {
                    recordId: CONSTITUENT_ID
                })
            ]).then(function (replies) {

                constituent.name = replies[0].data.values[0].value;
                constituent.company = replies[1].data.values[5].value; // PRIMARYBUSINESSNAME

            }, function (response) {
                alert("Something went wrong!");
                console.error(JSON.stringify(response));
            }).finally(function () {
                $scope.loading = false;
            });

        }

        getConstituentAsync();

        return {
            constituent: constituent
        };

    }]);
</code></pre>

Because the requests to CRM can take some time, it's a good idea to add a spinner so that the user knows that something is happening. Use the SKY UX [wait component](http://skyux.developer.blackbaud.com/components/wait/) to easily show that something is happening. In the controller above, we set the `loading` value to true when we started the request, and to false when the request was finished.

`<div ng-controller="ConstituentController as constitCtrl" bb-wait="loading">`

Now you have a SKY UX application that can talk to your Blackbaud CRM installation! Because we are using the webshell service to talk to CRM, security is included. You shouldn't need to do any additional work to get the security for your application to work just like it does in CRM. You will be using CRM feature specs behind the scenes, so any user that does not have rights to a certain feature will not be able to successfully complete the call.

This does mean that you need to check for feature permissions in some cases. For example, if a user does not have rights an edit form, you should hide or disable the button conditionally. The Infinity webshell handles this kind of permissions for you and only displays features that the current user has permission to use.

<hr>

<p><strong>Next step:</strong> <a href="#!/guide/navigation">Navigation »</a></p>
