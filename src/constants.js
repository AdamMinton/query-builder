module.exports = {
  uidTag: 'google-ads-uid',
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
  formDestination: '1::google_ads_customer_match'
}
