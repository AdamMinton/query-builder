project_name: "looker-demo-project"

application: looker-demo-project {
  label: "Looker demo"
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
      "scheduled_plan_run_once",
      "create_scheduled_plan",
      "model_fieldname_suggestions",
      "all_timezones"
    ]
    new_window: yes
    new_window_external_urls: ["https://actions.looker.com"]
  }
}