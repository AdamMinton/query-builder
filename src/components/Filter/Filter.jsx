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
import { Box2, IconButton } from '@looker/components'
import { Filter, useSuggestable } from '@looker/filter-components'
import { TimeFilter } from '../TimeFilter/TimeFilter.jsx'
import { StyledItemInner, StyledLabel } from './Filter.styles'
import { Close } from '@styled-icons/material/Close'

export const FilterItem = ({ activeFilters, filter, setActiveFilters, sdk }) => {
  
  const [expression, setExpression] = useState('')

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

  const removeFilter = (filter) => {
    activeFilters.splice(
      activeFilters.findIndex((item) => item.id === filter.id),
      1
    )
    setActiveFilters([...activeFilters])
  }
  
  const { errorMessage, suggestableProps } = useSuggestable({
    filter,
    sdk,
  })

  return (
    <Box2 m="u3">
      <StyledItemInner>
        <IconButton
          icon={<Close />}
          label="Remove Filter"
          onClick={removeFilter}
        />
        <StyledLabel fontSize="small">{filter.label}</StyledLabel>

        {filter.type === 'string' && (
          <Filter
            name={filter.label}
            type="field_filter"
            expressionType="string"
            expression={expression}
            onChange={handleChange}
            {...suggestableProps}
          />
        )}
        {filter.type === 'number' && (
          <Filter
            name={filter.label}
            type="field_filter"
            expressionType="number"
            expression={expression}
            onChange={handleChange}
          />
        )}
        {filter.type === 'date' && (
          <TimeFilter
            activeFilters={activeFilters}
            filter={filter}
            setActiveFilters={setActiveFilters}
          />
        )}
        {filter.type === 'location' && (
          <Filter
            name={filter.label}
            expressionType="location"
            expression={expression}
            onChange={handleChange}
          />
        )}
        {filter.type === 'yesno' && (
          <Filter
            name={filter.label}
            expressionType="string"
            expression={expression}
            onChange={handleChange}
            config={{ type: 'button_toggles' }}
            suggestions={['Yes','No']}
          />
        )}
      </StyledItemInner>
    </Box2>
  )
}

FilterItem.propTypes = {
  activeFilters: PropTypes.array,
  filter: PropTypes.object,
  setActiveFilters: PropTypes.func,
  sdk: PropTypes.object
}
