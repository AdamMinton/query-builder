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
import React, { useState, useEffect } from 'react'
import { ComponentsProvider, Space, Button, Divider } from '@looker/components'
import { LookerExtensionSDK, connectExtensionHost } from '@looker/extension-sdk'
import { ModelAndExploreMenu } from './components/ModelAndExploreMenu/ModelAndExploreMenu'
import { Sidebar } from './components/Sidebar/Sidebar'
import { StyledRightSidebar, StyledSidebar } from './App.styles'
import { SegmentLogic } from './components/SegmentLogic/SegmentLogic'
import mockData from './mock-data.json'
import { BuildAudienceDialog } from './components/BuildAudienceDialog/BuildAudienceDialog'

export const App = hot(() => {
  
  const [models, setModels] = useState([{value: '', name: 'Choose a Model'}])
  const [explores, setExplores] = useState({ temp: [{value: '', name: 'Choose an Explore'}]})
  const [filters, setFilters] = useState({})
  const [activeModel, setActiveModel] = useState('')
  const [activeExplore, setActiveExplore] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [buildAudienceOpen, setBuildAudienceOpen] = useState(false)
  const [coreSDK, setCoreSDK] = useState({})
    
  const handleBuildAudienceClick = () => {
    setBuildAudienceOpen(!buildAudienceOpen)
  }

  const buildFilterMenu = async () => {
    console.log('building-appjs')
    console.log(coreSDK)
    const result = await coreSDK.lookml_model_explore(activeModel,activeExplore)
    console.log(result)
    const fields = result.value.fields
    let tempObj = {}
    result.value.scopes.forEach(scope => {
      tempObj[scope] = { 
        id: scope,
        label: '',
        items: []
      }
    })
    for (let categories in fields) {
      fields[categories].forEach(field => {
        tempObj[field.scope].label = field.view_label
        tempObj[field.scope].items.push({
          id: field.name,
          label: field.label_short,
          type: field.type
        })
      })
    }
    let filterObj = { items: [] }
    for (let scope in tempObj) {
      filterObj.items.push(tempObj[scope])
    }
    setFilters(filterObj)
    console.log(filterObj)
  }

  useEffect(() => {
    const pullModelsAndExplores = async () => {
      const extensionSDK = await connectExtensionHost()
      const tempSDK = LookerExtensionSDK.create40Client(extensionSDK)
      const result = await tempSDK.all_lookml_models('name,explores')
      let tempModels = []
      let tempExplores = {}
      result.value.forEach(model => {
        if (model.explores.length) {
          tempModels.push({ value: model.name, label: model.label})
          tempExplores[model.name] = []
          model.explores.forEach(explore => {
            tempExplores[model.name].push({ value: explore.name, label: explore.label})
          })
        }
      })
      setModels(tempModels)
      setExplores(tempExplores)
      setCoreSDK(tempSDK)
    }
    pullModelsAndExplores()
  }, [])
  
  return (
    <ComponentsProvider>
      <Space height="100%" align="start">
        <StyledSidebar width="324px" height="100%" align="start">
        <ModelAndExploreMenu
          models = {models}
          explores = {explores}
          activeModel = {activeModel}
          activeExplore = {activeExplore}
          setActiveModel = {setActiveModel}
          setActiveExplore = {setActiveExplore}
          coreSDK = {coreSDK}
          buildFilterMenu = {buildFilterMenu}
        />
          <Divider mt="u4" appearance="light" />
          <Sidebar
            filters={mockData.items}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        </StyledSidebar>

        <Space>
          <SegmentLogic
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        </Space>
        <StyledRightSidebar
          width="324px"
          height="100%"
          align="start"
          p="large"
        >
          <Button>Check Audience Size</Button>
          <Button onClick={handleBuildAudienceClick}>Build Audience</Button>
        </StyledRightSidebar>
      </Space>

      <BuildAudienceDialog
        isOpen={buildAudienceOpen}
        setIsOpen={setBuildAudienceOpen}
      />
    </ComponentsProvider>
  )
})
