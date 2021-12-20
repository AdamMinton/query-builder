/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Span, Space, ProgressCircular, MessageBar } from '@looker/components'
import { Filter } from '@looker/filter-components'
// import { StyledItemInner, StyledLabel } from './Filter.styles'
const reader = new FileReader();

export const AudienceSize = ({ activeFilters, uidField, requiredFields, setQuery, coreSDK, activeModel, activeExplore, size, setSize }) => {

  const [isCalculating, setIsCalculating] = useState(false)
  const [isQueryError, setIsQueryError] = useState(false)

  const display = new Intl.NumberFormat('en-US', {style: 'decimal'});
  
  const sqlAssembler = sql => `WITH query AS (${sql}) SELECT COUNT (DISTINCT ${uidField.replaceAll('.','_')}) AS size FROM query`
  
  const checkAudienceSize = async () => {
    setIsCalculating(true)
    setIsQueryError(false)
    let body = {
      model: activeModel,
      view: activeExplore,
      filters: {},
      fields: [uidField]
    }
    activeFilters.forEach(filter => {
      body.filters[filter.id] = filter.expression
    })
    for (let requirement in requiredFields) {
      body.fields = body.fields.concat(requiredFields[requirement])
    }
    setQuery(body)
    const result = await coreSDK.run_inline_query({ result_format: 'sql', body })
    const rawSql = await result.value.text()
    const sql = sqlAssembler(rawSql)
    const query = await coreSDK.create_sql_query({ model_name: activeModel, sql })
    const queryResult = await coreSDK.run_sql_query(query.value.slug, 'json')
    console.log(queryResult)
    setIsCalculating(false)
    if (!queryResult.ok) {
      setIsQueryError(true)
    } else {
      setSize(queryResult.value[0].size)
    }
  }

  return (
    <div>
      { activeFilters.length
        ? <Button onClick={checkAudienceSize}>Check Audience Size</Button>
        : <Button disabled>Check Audience Size</Button> }
      <br></br>
      <br></br>
      { isCalculating
        ? <Space justifyContent="left"><ProgressCircular /></Space>
        : !!activeFilters.length
          ? isQueryError
            ? <MessageBar intent="critical">
                Looker error.  Please check the console and your filter set and try again.
              </MessageBar>
            : <Span fontSize="xxxxlarge">{display.format(size)}</Span>
          : <Span fontSize="xxxxlarge" color="text1">{size}</Span>
      }
    </div>
  )
}

AudienceSize.propTypes = {
  activeFilters: PropTypes.array,
  uidField: PropTypes.string,
  requiredFields: PropTypes.object,
  setQuery: PropTypes.func,
  coreSDK: PropTypes.object,
  activeModel: PropTypes.string,
  activeExplore: PropTypes.string,
  size: PropTypes.number,
  setSize: PropTypes.func
}
