project_name: "looker-demo-project"

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
