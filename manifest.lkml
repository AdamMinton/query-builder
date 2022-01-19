project_name: "customer_match_action_tool"

# # Use local_dependency: To enable referencing of another project
# # on this instance with include: statements
#
# local_dependency: {
#   project: "name_of_other_project"
# }
application: customer-match-tool {
  label: "Customer Match Tool"
  # file: "bundle.js"
  url: "http://localhost:8080/bundle.js"
  entitlements: {
    core_api_methods: [
      "me",
      "all_lookml_models",
      "lookml_model_explore",
      "run_inline_query",
      "create_sql_query",
      "run_sql_query",
      "create_query",
      "create_look",
      "fetch_integration_form",
      "scheduled_plan_run_once"
    ]
    new_window: yes
    new_window_external_urls: ["https://actions.looker.com"]
  }
}
