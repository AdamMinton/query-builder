## Instructions

1. Start by choosing a model and an explore. Only models and explores that are compatible with the tool will be presented as options.
2. When an explore has been chosen, a list of available dimensions and measures, organized by category, will appear in the left sidebar. If your explore hasn't been properly configured according to the rules mentioned above, a message indicating the issue will appear in the sidebar instead.
3. Clicking on a dimension or measure will add that dimension or measure to the center of the screen, where you can then set how you want to use its values as a filter. You can remove filters by clicking on the dimension or measure again, or by clicking the "x" next to the filter in the center panel.

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

6. This repo has a `manifest.lkml` file. Either drag & upload this file into your Looker project, or create a `manifest.lkml` with the same content. Change the `id` and `label` as needed.

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
