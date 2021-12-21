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
import constants from './constants.js'

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
  const [isGettingExplore, setIsGettingExplore] = useState(false)
  const [size, setSize] = useState(0)
  const [actionFormFields, setActionFormFields] = useState([]);
  const [actionInitFormParams, setInitActionFormParams] = useState({});
  const [globalActionFormParams, setGlobalActionFormParams] = useState({});
  const [isGettingForm, setIsGettingForm] = useState(false)
  const [lookId, setLookId] = useState(null)
  const [needsOauth, setNeedsOauth] = useState(false)
  const [extensionSDK, setExtensionSDK] = useState({})
  const [isFormWorking, setIsFormWorking] = useState(false)
  const [currentNumberOfFields, setCurrentNumberOfFields] = useState(1)
  const [wasActionSuccessful, setWasActionSuccessful] = useState('')
    
  const getForm = async () => {
    console.log('getting form', globalActionFormParams)
    const form = await coreSDK.fetch_integration_form(constants.formDestination, globalActionFormParams)
    const formParams = form.value.fields.reduce(
      (obj, item) => ({ ...obj, [item.name]: "" }),
      {}
    );
    setInitActionFormParams(formParams);
    setActionFormFields(form.value.fields);
    setIsGettingForm(false)
  };
  
  const handleBuildAudienceClick = async () => {
    setIsGettingForm(true)
    const createdQuery = await coreSDK.create_query(query)
    const id = createdQuery.value.id
    setQuery({...query, id})
    const lookRequestBody = {
      "title": `Google Ads Customer Match Extension|${activeModel}::${activeExplore}|${new Date().toUTCString()}`,
      "is_run_on_load": false,
      "public": false,
      "query_id": id,
      "folder_id": 1 // may need to dynamically determine ID of "Shared" folder?
    }
    const createdLook = await coreSDK.create_look(lookRequestBody)
    // console.log(createdLook)
    setLookId(createdLook.value.id)
    await getForm()
    setBuildAudienceOpen(!buildAudienceOpen)
  }

  useEffect(async () => {
    const tempExtensionSDK = await connectExtensionHost()
    const tempSDK = LookerExtensionSDK.create40Client(tempExtensionSDK)
    setExtensionSDK(tempExtensionSDK)
    setCoreSDK(tempSDK)
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
  }, [])
  
  useEffect(async () => {
    activeExplore !== '' && setIsGettingExplore(true)
    setExploreIsValid(null)
    const result = await coreSDK.lookml_model_explore(activeModel,activeExplore)
    let isRequiredTagPresent = false
    const fields = result.value.fields
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
    for (let category of ['dimensions','measures']) {
      fields[category].forEach(field => {
        if (constants.typeMap.hasOwnProperty(field.type)) {
          tempObj[field.scope].label = field.view_label
          tempObj[field.scope].items.push({
            id: field.name,
            label: field.label_short,
            type: constants.typeMap[field.type]
          })
          for (let i=0; i<field.tags.length; i++) {
            if (field.tags[i] === constants.uidTag) {
              console.log('uid', field.name)
              tempUidField.push(field.name)
            }
            if (constants.googleAdsTags.includes(field.tags[i])) {
              const coreString = field.tags[i].split('-')[2]
              if (field.name.includes(coreString)) {
                isRequiredTagPresent = true
                if (tempRequiredFields.hasOwnProperty(field.tags[i])) {
                  tempRequiredFields[field.tags[i]].push(field.name)
                } else {
                  tempRequiredFields[field.tags[i]] = [ field.name ]
                }
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
    setIsGettingExplore(false)
    setFilters(filterObj)
    setExploreIsValid(tempUidField.length === 1 && isRequiredTagPresent)
    setRequiredFields(tempRequiredFields)
    setUidField(tempUidField)
  }, [activeExplore])

  useEffect(() => {
    if (!activeFilters.length) {
      setSize(0)
    }
  }, [activeFilters])

  useEffect(() => {
    console.log('form fields length', actionFormFields.length)
    console.log('current number', currentNumberOfFields)
    if (!actionFormFields.length) {
      setCurrentNumberOfFields(1)
      return
    }
    if (actionFormFields.length !== currentNumberOfFields) {
      console.log('bingo, new field')
      setIsFormWorking(false)
      setCurrentNumberOfFields(actionFormFields.length)
    }
  }, [actionFormFields])

  useEffect(() => console.log('uid state', uidField), [uidField])
  useEffect(() => console.log('reqd state', requiredFields), [requiredFields])
  useEffect(() => console.log('valid', exploreIsValid), [exploreIsValid])
  useEffect(() => console.log('query', query), [query])
  useEffect(() => {
    console.log('form params', globalActionFormParams)
    getForm()
  }, [globalActionFormParams])
  // useEffect(() => console.log('needs oauth', needsOauth), [needsOauth])

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
          { isGettingExplore && <Space justifyContent="center">
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
            coreSDK={coreSDK}
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
            ? <Button onClick={handleBuildAudienceClick}>One-Time Audience Build</Button>
            : <Button disabled>One-Time Audience Build</Button> }
          { size
            ? <Button onClick={handleBuildAudienceClick}>Scheduled Audience Build</Button>
            : <Button disabled>Scheduled Audience Build</Button> }
          { isGettingForm && <Space justifyContent="left"><ProgressCircular /></Space> }
        </StyledRightSidebar>
      </Space>

      <BuildAudienceDialog
        isOpen={buildAudienceOpen}
        setIsOpen={setBuildAudienceOpen}
        actionFormFields={actionFormFields}
        setActionFormFields={setActionFormFields}
        actionInitFormParams={actionInitFormParams}
        setGlobalActionFormParams={setGlobalActionFormParams}
        coreSDK={coreSDK}
        queryId={query.id}
        extensionSDK={extensionSDK}
        getForm={getForm}
        isFormWorking={isFormWorking}
        setIsFormWorking={setIsFormWorking}
        wasActionSuccessful={wasActionSuccessful}
        setWasActionSuccessful={setWasActionSuccessful}
      />
    </ComponentsProvider>
  )
})
