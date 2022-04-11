# Welcome to the Looker Google Ads Customer Match Demo Application

## Overview

The Looker Google Ads Customer Match Demo Application is a Looker in-platform extension that utilizes an improved UI for leveraging the existing [Google Ads Customer Match Action from Looker's Action Hub](https://looker.com/platform/actions/customer-match).  In addition to exposing the functionality of the action, which allows a user to define and send segments and audiences directly from Looker to a Google Ads account, this application gives a user the ability to adjust filters on the fly and assess the size of the segment before electing to push anything to Google Ads.

## Requirements

- A Google ID (for authenticating access to Google Ads)

- A Google Ads account to which the Looker user has access

- Your Looker project must have a `model` LookML file that possesses the following characteristics:

   * The model is connected to the project (see [here](https://docs.looker.com/data-modeling/getting-started/create-projects#configuring_a_model) on how to configure this connection).
   * The data within should be modeled as per normal practices and any ids should be at the customer grain.

- A Looker explore that has been modified in the following ways:

   * A pre-determined string has been added to the description field, to indicate to the tool that the explore is compatible with the tool.  We recommend `#audience-builder`.  If you go with a different string, you will need to update the appropriate value in the [constants](src/constants.js) file.

   * Dimensions or metrics meeting the following criteria:
      * A single field, representing a unique ID, [tagged](https://docs.looker.com/reference/field-params/tags) with a pre-determined value in the lkml. We recommend `google-ads-uid`.  Again, if you go with a different tag, you will need to update the appropriate value in the [constants](src/constants.js) file.

      * At least one field [tagged](https://docs.looker.com/reference/field-params/tags) with any of the following identifiers (these should not be customized), to indicate a field that contains personal information::

         * `google-ads-idfa` (for a field containing an Apple IDFA value)
         * `google-ads-aaid` (for a field containing an Google AAID value)
         * `google-ads-email` (for a field containing an email address)
         * `google-ads-phone` (for a field containing a phone number)
         * `google-ads-first` (for a field containing a first name)
         * `google-ads-last` (for a field containing a last name)
         * `google-ads-street` (for a field containing a street address)
         * `google-ads-city` (for a field containing a city name)
         * `google-ads-state` (for a field containing a state name)
         * `google-ads-country` (for a field containing a country name)
         * `google-ads-postal` (for a field containing a postal or ZIP code)

         *Please note that more than one field can get each label.  The only requirement is that **one field somewhere in the data must have one of these labels.**  Additionally, the tool will validate your lkml for compliance and alert you if your explore doesn't have the proper tagging.*

   * Any field tagged with one of the tags above **MUST** have the identifier (i.e., the string following the second hyphen in the tag) included as part of the label.  For example, a field that contains a city name must have the word "city" in the field label.  This is because the connection between Looker data and Google Ads is done via regular expressions (see [here](https://help.looker.com/hc/en-us/articles/4403987588371) for more details).  If the field in question does not already have the identifier in the label, you have two options:

      * You can append the identifier to the existing label, or

      * You can duplicate the dimension and add the identifier to the duplicate field's label while also adding the `google-ads-duplicate` tag to the duplicate field (in order to prevent the duplicate field from appearing in the UI).



=====================
## Instructions

In general, you'll want to work from left to right.

1. Start by choosing a model and an explore.  Only models and explores that are compatible with the tool will be presented as options.
2. When an explore has been chosen, a list of available dimensions and metrics, organized by category, will appear in the left sidebar.  If your explore hasn't been properly configured according to the rules mentioned above, a message indicating the issue will appear in the sidebar instead.
3. Clicking on a dimension or metric will add that dimension or metric to the center of the screen, where you can then set how you want to use its values as a filter.  You can remove filters by clicking on the dimension or metric again, or by clicking the "x" next to the filter in the center panel.
4. When your filters are set, click the "Check Audience Size" button on the right to evaluate the size of an audience meeting the filter criteria.
5. When you're satisfied with the size of the audience, begin the process of sending the audience to Google Ads by clicking either "Send Audience Now," for a one-time, immediate audience build, or by selecting a frequency, time of day, and time zone to enable the "Schedule Recurring Send" option.
6. Each option will open a pop-up that requires you to login to Google Ads (if not logged in already) and then walks you through the audience creation/updating process, step by step.
7. At the end, click the "Send Audience Now" or "Schedule Recurring Send" button in the pop-up window and wait for an indication of the success or failure of your efforts.


=====================
## Development

1. Clone this repo.
2. Navigate to the repo directory on your system.
3. Install the dependencies with [Yarn](https://yarnpkg.com/).

   ```
   yarn install
   ```

4. Start the development server

   ```
   yarn develop
   ```

   The extension is now running and serving the JavaScript locally at http://localhost:8080/bundle.js.

5. Log in to Looker and create a new project.

   This is found under **Develop** => **Manage LookML Projects** => **New LookML Project**.

   Select "Blank Project" as your "Starting Point". This will create a new project with no files.

6. This repo has a `manifest.lkml` file.  Either drag & upload this file into your Looker project, or create a `manifest.lkml` with the same content. Change the `id` and `label` as needed.

7. Connect the project to Git. This can be done in multiple ways:

- Create a new repository on GitHub or a similar service, and follow the instructions to [connect your project to Git](https://docs.looker.com/data-modeling/getting-started/setting-up-git-connection)
- A simpler but less powerful approach is to set up git with the "Bare" repository option which does not require connecting to an external Git Service.

8. Commit the changes and deploy them to production through the Project UI.

9. Reload the page and click the `Browse` dropdown menu. You will see the extension in the list.
   - The extension will load the JavaScript from the `url` provided in the `application` definition. By default, this is http://localhost:8080/bundle.js. If you change the port your server runs on in the package.json, you will need to also update it in the manifest.lkml.
   - Refreshing the extension page will bring in any new code changes from the extension template, although some changes will hot reload.

## Deployment

The process above describes how to run the extension for development. Once you're done developing and ready to deploy, the production version of the extension may be deployed as follows:

1. In the extension project directory build the extension by running `yarn build`.
2. Drag and drop the generated `dist/bundle.js` file into the Looker project interface.
3. Modify the `manifest.lkml` to use `file: "bundle.js"` instead of `url: "http://localhost:8080/bundle.js"`.


<br>Andrew Fechner
<br>North American Lead, Solutions Engineering
<br>Media.Monks
<br>March, 2022
