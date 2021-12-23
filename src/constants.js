module.exports = {
  
  // Tag used to indicate the Looker field designated as the UID
  uidTag: 'google-ads-uid',
  
  // Tags used to indicate Looker fields that match the fields utilized by the Customer Match Action
  // See https://help.looker.com/hc/en-us/articles/4403987588371 for more details
  googleAdsTags: [
    'google-ads-idfa',
    'google-ads-aaid',
    'google-ads-email',
    'google-ads-phone',
    'google-ads-first',
    'google-ads-last',
    'google-ads-street',
    'google-ads-city',
    'google-ads-state',
    'google-ads-country',
    'google-ads-postal'
  ],

  // List of permissable data types for fields, including types that need to be coerced for filtering
  typeMap: {
    number: 'number',
    string: 'string',
    yesno: 'yesno',
    date: 'date',
    date_date: 'date',
    zipcode: 'string',
    count: 'number',
    average_distinct: 'number',
    date_year: 'number',
    date_day_of_month: 'number',
    date_day_of_year: 'number',
    date_month: 'number',
    count_distinct: 'number',
    sum_distinct: 'number',
    max: 'number',
    min: 'number',
    average: 'number',
    sum: 'number'
  },

  // Looker API destination for Customer Match action
  formDestination: '1::google_ads_customer_match'
}
