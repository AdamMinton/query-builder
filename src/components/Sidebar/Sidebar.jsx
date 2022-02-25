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
import React from 'react'
import PropTypes from 'prop-types'
import { StyledSidebar } from './Sidebar.styles'
import { TreeCollection, Tree } from '@looker/components'
import { TreeButton } from './components/TreeButton'

export const Sidebar = ({ filters, activeFilters, setActiveFilters }) => {
  const handleFilterClick = (filterItem) => {
    if (activeFilters.find((item) => item.id === filterItem.id)) {
      // Filter active - Remove from array
      activeFilters.splice(
        activeFilters.findIndex((item) => item.id === filterItem.id),
        1
      )
      setActiveFilters([...activeFilters])
    } else {
      // Add new filter to array
      setActiveFilters([...activeFilters, filterItem])
    }
  }

  return (
    <StyledSidebar>
      {filters.map((section) => (
        <TreeCollection key={section.id}>
          <Tree label={section.label} border>
            {section.items.map((filter) => {
              if (filter.items) {
                return (
                  <Tree key={filter.id} label={filter.label}>
                    {filter.items.map((childFilter) => (
                      <TreeButton
                        key={childFilter.id}
                        item={childFilter}
                        onClick={handleFilterClick}
                        selected={
                          !!activeFilters.find(
                            (item) => item.id === childFilter.id
                          )
                        }
                      />
                    ))}
                  </Tree>
                )
              }
              return (
                <TreeButton
                  key={filter.id}
                  item={filter}
                  onClick={handleFilterClick}
                  selected={
                    !!activeFilters.find((item) => item.id === filter.id)
                  }
                />
              )
            })}
          </Tree>
        </TreeCollection>
      ))}
    </StyledSidebar>
  )
}

Sidebar.propTypes = {
  filters: PropTypes.array,
  setActiveFilters: PropTypes.func,
  activeFilters: PropTypes.array,
}
