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

import { hot } from 'react-hot-loader/root'
import React, { useState } from 'react'
import { ExtensionProvider } from '@looker/extension-sdk-react'
import { ComponentsProvider, Space, Button } from '@looker/components'
import { Sidebar } from './components/Sidebar/Sidebar'
import { StyledRightSidebar, StyledSidebar } from './App.styles'
import { SegmentLogic } from './components/SegmentLogic/SegmentLogic'
import mockData from './mock-data.json'

export const App = hot(() => {
  const [activeFilters, setActiveFilters] = useState([])

  return (
    <ExtensionProvider>
      <ComponentsProvider>
        <Space height="100%" align="start">
          <StyledSidebar width="324px" height="100%" align="start">
            <Sidebar
              filters={mockData.items}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />
          </StyledSidebar>

          <Space>
            <SegmentLogic activeFilters={activeFilters} />
          </Space>
          <StyledRightSidebar
            width="324px"
            height="100%"
            align="start"
            p="large"
          >
            <Button>Check audiance size</Button>
          </StyledRightSidebar>
        </Space>
      </ComponentsProvider>
    </ExtensionProvider>
  )
})
