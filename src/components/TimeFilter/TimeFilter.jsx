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
import { FieldSelect } from '@looker/components'
import { Filter } from '@looker/filter-components'
// import { StyledItemInner, StyledLabel } from './Filter.styles'

export const TimeFilter = ({ activeFilters, filter, setActiveFilters }) => {
  const [expression, setExpression] = useState('')
  const [dateOption, setDateOption] = useState({})

  const today = new Date()
  let lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const dateOptions = [
    { value: 'relative_timeframes', label: "Relative Timeframe"},
    { value: 'day_range_picker', label: "Date Range"},
    { value: 'day_picker', label: "Individual Day"}
  ]

  const defaultExpressions = {
    relative_timeframes: "7 day",
    day_range_picker: `${lastWeek.toISOString().slice(0, 10)} to ${today.toISOString().slice(0, 10)}`,
    day_picker: today.toISOString().slice(0, 10)
  }

  const handleChange = (value) => {
    setExpression(value.expression)

    // Find current filter and update expression value
    const newFilters = activeFilters.map((f) => {
      if (f.id === filter.id) {
        return {
          ...f,
          expression: value.expression,
        }
      }
      return f
    })

    setActiveFilters(newFilters)
  }

  useEffect(() => { setExpression(defaultExpressions[dateOption.type]) }, [dateOption])

  return (
    <div>
      <FieldSelect
        name="Date Options"
        placeholder="Choose a Date Input"
        options={dateOptions}
        onChange={(event) => { setDateOption({ type: event }) }}
      />
      <Filter
        name={filter.label}
        expressionType="date"
        expression={expression}
        onChange={handleChange}
        config={dateOption}
      />
    </div>
  )
}

TimeFilter.propTypes = {
  activeFilters: PropTypes.array,
  filter: PropTypes.object,
  setActiveFilters: PropTypes.func,
}