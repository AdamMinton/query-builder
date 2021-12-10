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
import { ComponentsProvider, Space, Button, Divider, ProgressCircular, MessageBar, Code } from '@looker/components'
import { LookerExtensionSDK, connectExtensionHost } from '@looker/extension-sdk'
import { ModelAndExploreMenu } from './components/ModelAndExploreMenu/ModelAndExploreMenu'
import { Sidebar } from './components/Sidebar/Sidebar'
import { AudienceSize } from './components/AudienceSize/AudienceSize'
import { StyledRightSidebar, StyledSidebar } from './App.styles'
import { SegmentLogic } from './components/SegmentLogic/SegmentLogic'
import mockData from './mock-data.json'
import { BuildAudienceDialog } from './components/BuildAudienceDialog/BuildAudienceDialog'

export const App = hot(() => {
  
  const [models, setModels] = useState([{value: '', name: 'Choose a Model'}])
  const [explores, setExplores] = useState({ temp: [{value: '', name: 'Choose an Explore'}]})
  const [filters, setFilters] = useState({ items: [] })
  const [activeModel, setActiveModel] = useState('')
  const [activeExplore, setActiveExplore] = useState('')
  const [exploreIsValid, setExploreIsValid] = useState(null)
  const [uidField, setUidField] = useState([])
  const [requiredFields, setRequiredFields] = useState({})
  const [activeFilters, setActiveFilters] = useState([])
  const [buildAudienceOpen, setBuildAudienceOpen] = useState(false)
  const [coreSDK, setCoreSDK] = useState({})
  const [query, setQuery] = useState({})
  const [isWorking, setIsWorking] = useState(false)
  const [size, setSize] = useState('')
  
  const uidTag = 'google-ads-uid'
  const googleAdsTags = [
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
  ]
    
  const handleBuildAudienceClick = async () => {
    setBuildAudienceOpen(!buildAudienceOpen)
    const createdQuery = await coreSDK.create_query(query)
    console.log(createdQuery)
    const id = createdQuery.value.id
    setQuery({...query, id})
    const lookRequestBody = {
      "title": `Google Ads Customer Match Extension|${activeModel}::${activeExplore}|${new Date().toUTCString()}`,
      // "user_id": 0,
      // "deleted": false,
      // "description": "here we go", //figure out how to populate
      "is_run_on_load": false,
      "public": false,
      "query_id": id,
      // "folder": { 'name': ' '}, //figure out if required
      "folder_id": 1
      // "query": {}
    }
    const createdLook = await coreSDK.create_look(lookRequestBody)
    console.log(createdLook)
    // connect look fields to existing integration form needs?
  }

  useEffect(async () => {
    const extensionSDK = await connectExtensionHost()
    const tempSDK = LookerExtensionSDK.create40Client(extensionSDK)
    setCoreSDK(tempSDK)
    // console.log(tempSDK)
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
    // maybe fetch_integration_form for the action hub on load?
  }, [])
  
  useEffect(async () => {
    activeExplore !== '' && setIsWorking(true)
    const result = await coreSDK.lookml_model_explore(activeModel,activeExplore)
    let isUidPresent = false
    let isRequiredTagPresent = false
    const fields = result.value.fields
    // let tempAllFields = []
    let tempObj = {}
    let tempRequiredFields = {}
    let tempUidField = []
    result.value.scopes.forEach(scope => {
      tempObj[scope] = { 
        id: scope,
        label: '',
        items: []
      }
    })
    const typeMap = {
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
    }
    for (let category of ['dimensions','measures']) {
      fields[category].forEach(field => {
        if (typeMap.hasOwnProperty(field.type)) {
          // tempAllFields.push(field.name)
          tempObj[field.scope].label = field.view_label
          tempObj[field.scope].items.push({
            id: field.name,
            label: field.label_short,
            type: typeMap[field.type]
          })
          for (let i=0; i<field.tags.length; i++) {
            if (field.tags[i] === uidTag) {
              console.log('uid', field.name)
              isUidPresent = true
              tempUidField.push(field.name)
            }
            if (googleAdsTags.includes(field.tags[i])) {
              const coreString = field.tags[i].split('-')[2]
              if (field.name.includes(coreString)) {
                // console.log(field.tags[i], field.name)
                isRequiredTagPresent = true
                if (tempRequiredFields.hasOwnProperty(field.tags[i])) {
                  tempRequiredFields[field.tags[i]].push(field.name)
                } else {
                  tempRequiredFields[field.tags[i]] = [ field.name ]
                }
                // console.log(tempRequiredFields)
              }
            }
          }
        }
      })
    }
    let filterObj = { items: [] }
    for (let scope in tempObj) {
      if (tempObj[scope].items.length) {
        filterObj.items.push(tempObj[scope])
      }
    }
    setIsWorking(false)
    setFilters(filterObj)
    console.log(filterObj)
    setExploreIsValid(tempUidField.length === 1 && isRequiredTagPresent)
    setRequiredFields(tempRequiredFields)
    setUidField(tempUidField)
  }, [activeExplore])

  useEffect(() => {
    if (!activeFilters.length) {
      setSize(0)
    }
  }, [activeFilters])
  useEffect(() => console.log('uid state', uidField), [uidField])
  useEffect(() => console.log('reqd state', requiredFields), [requiredFields])
  useEffect(() => console.log('valid', exploreIsValid), [exploreIsValid])

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
        />
          <Divider mt="u4" appearance="light" />
          { isWorking && <Space justifyContent="center">
                          <ProgressCircular />
                        </Space>
          }
          { !exploreIsValid
              ? exploreIsValid === null
                ? <div></div>
                : uidField.length !== 1
                  ? <MessageBar intent="critical">
                      Please ensure one and only one field in your model has the <Code>google-ads-uid</Code> tag.
                    </MessageBar>
                  : <MessageBar intent="critical">
                      No fields in your model were correctly tagged and named for the Google Ads Customer Match action.
                    </MessageBar>
              : <Sidebar
                  //filters={mockData.items}
                  filters={filters.items}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                />
          }
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
          <AudienceSize
            activeFilters={activeFilters}
            uidField={uidField[0]}
            requiredFields={requiredFields}
            setQuery={setQuery}
            coreSDK={coreSDK}
            activeModel={activeModel}
            activeExplore={activeExplore}
            size={size}
            setSize={setSize}
          />
          <Divider mt="u4" appearance="light" />
          { size
            ? <Button onClick={handleBuildAudienceClick}>Build Audience</Button>
            : <Button disabled>Build Audience</Button> }
        </StyledRightSidebar>
      </Space>

      <BuildAudienceDialog
        isOpen={buildAudienceOpen}
        setIsOpen={setBuildAudienceOpen}
      />
    </ComponentsProvider>
  )
})
