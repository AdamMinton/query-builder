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
import {
  ComponentsProvider,
  Button,
  Space,
  Divider,
  ProgressCircular,
  MessageBar,
  Code,
} from '@looker/components'
import { LookerExtensionSDK, connectExtensionHost } from '@looker/extension-sdk'
import { ModelAndExploreMenu } from './components/ModelAndExploreMenu/ModelAndExploreMenu'
import { Sidebar } from './components/Sidebar/Sidebar'
import {
  GoogleBlueTheme,
  StyledRightSidebar,
  StyledSidebar,
} from './App.styles'
import { SegmentLogic } from './components/SegmentLogic/SegmentLogic'
import constants from './constants.js'

export const App = hot(() => {
  const [models, setModels] = useState([{ value: '', name: 'Choose a Model' }])
  const [explores, setExplores] = useState({
    temp: [{ value: '', name: 'Choose an Explore' }],
  })
  const [filters, setFilters] = useState({ items: [] })
  const [activeModel, setActiveModel] = useState('')
  const [activeExplore, setActiveExplore] = useState('')
  const [exploreIsValid, setExploreIsValid] = useState(null)
  const [uidField, setUidField] = useState([])
  const [requiredFields, setRequiredFields] = useState({})
  const [activeFilters, setActiveFilters] = useState([])
  const [coreSDK, setCoreSDK] = useState({})
  const [isGettingExplore, setIsGettingExplore] = useState(false)
  const [extensionSDK, setExtensionSDK] = useState({})
  const [errorGettingExplore, setErrorGettingExplore] = useState(false)
  const [frequency, setFrequency] = useState('once')

  // Sorts model and explore names alphabetically
  const labelSorter = (a, b) => (a.label < b.label ? -1 : 1)

  // steps taken on page load
  useEffect(async () => {
    // connection made to Looker host and extension and core SDKs captured in state
    const tempExtensionSDK = await connectExtensionHost()
    const tempSDK = LookerExtensionSDK.create40Client(tempExtensionSDK)
    setExtensionSDK(tempExtensionSDK)
    setCoreSDK(tempSDK)

    // models and explores with valid datasets pre-loaded into state
    let doWeHaveTheModels = false
    let result
    while (!doWeHaveTheModels) {
      result = await tempSDK.all_lookml_models('name,explores')
      doWeHaveTheModels = !!result
    }
    let tempModels = []
    let tempExplores = {}
    result.value.forEach((model) => {
      if (model.explores.length) {
        tempExplores[model.name] = []
        model.explores.forEach((explore) => {
          // check explore description for text indicating explore's valid for the tool
          tempExplores[model.name].push({
            value: explore.name,
            label: explore.label,
          })
        })
        if (tempExplores[model.name].length) {
          tempModels.push({ value: model.name, label: model.label })
          tempExplores[model.name] = tempExplores[model.name].sort(labelSorter)
        }
      }
    })
    setModels(tempModels.sort(labelSorter))
    setExplores(tempExplores)
  }, [])

  // steps taken when an explore is chosen
  useEffect(async () => {
    // account for ephemeral issues with loading API
    if (
      !Object.getPrototypeOf(coreSDK).hasOwnProperty('lookml_model_explore')
    ) {
      return
    }

    activeExplore !== '' && setIsGettingExplore(true)
    setExploreIsValid(null)
    setErrorGettingExplore(false)
    let result

    // explore details retrieved via API
    try {
      result = await coreSDK.lookml_model_explore(
        activeModel,
        activeExplore,
        constants.fieldsList()
      )
    } catch (e) {
      console.log('Error getting explore', e)
      setErrorGettingExplore(true)
      return
    }
    let isRequiredTagPresent = false
    const fields = result.value.fields
    console.log(result.value)
    let tempObj = {}
    let tempRequiredFields = {}
    let tempUidField = []

    // explore scopes turned into top level categories for filter menu
    class topLevelDirectory {
      constructor(label) {
        this.id = label
        this.label = label
        this.items = []
      }
    }

    // dimensions and measures sorted by scope into filter menu
    for (let category of ['dimensions', 'measures']) {
      fields[category].forEach((field) => {
        // filter out unapproved data types and duplicate fields, build appropriate label
        if (
          constants.typeMap.hasOwnProperty(field.type) &&
          !field.tags.includes(constants.duplicateTag) &&
          !field.hidden
        ) {
          tempObj[field.view_label] =
            tempObj[field.view_label] || new topLevelDirectory(field.view_label)
          let displayName
          if (field.dimension_group) {
            displayName = field.field_group_label
              .replace('Date', '')
              .concat(` ${field.field_group_variant}`)
          } else {
            displayName = field.label_short
          }
          tempObj[field.view_label].items.push({
            id: field.name,
            label: displayName,
            type: constants.typeMap[field.type],
            model: activeModel,
            field: {
              suggest_dimension: field.suggest_dimension,
              suggest_explore: field.suggest_explore,
              view: field.view,
              suggestable: field.suggestable,
            },
          })

          // check to capture the presence of a designated UID field
          for (let i = 0; i < field.tags.length; i++) {
            if (field.tags[i] === constants.uidTag) {
              console.log('uid', field.name)
              tempUidField.push(field.name)
            }

            // check to capture the presence of designated PII fields required by customer match action
            if (constants.googleAdsTags.includes(field.tags[i])) {
              const coreString = field.tags[i].split('-')[2]
              if (field.name.includes(coreString)) {
                isRequiredTagPresent = true
                if (tempRequiredFields.hasOwnProperty(field.tags[i])) {
                  tempRequiredFields[field.tags[i]].push(field.name)
                } else {
                  tempRequiredFields[field.tags[i]] = [field.name]
                }
              }
            }
          }
        }
      })
    }
    let filterObj = { items: [] }
    // for (let scope in tempObj) {
    //   if (tempObj[scope].items.length) {
    //     filterObj.items.push(tempObj[scope])
    //   }
    // }
    for (let label in tempObj) {
      if (tempObj[label].items.length) {
        filterObj.items.push(tempObj[label])
      }
    }
    setIsGettingExplore(false)
    setFilters(filterObj)

    // check for presence of single UID field and a minimum of one PII field
    setExploreIsValid(true)

    setRequiredFields(tempRequiredFields)
    setUidField(tempUidField)
  }, [activeExplore])

  const handleRunButtonClick = () => {}

  // App Component HTML
  return (
    <ComponentsProvider theme={GoogleBlueTheme}>
      <Space height="100%" align="start">
        <StyledSidebar width="324px" height="100%" align="start">
          <ModelAndExploreMenu
            models={models}
            explores={explores}
            activeModel={activeModel}
            activeExplore={activeExplore}
            setActiveModel={setActiveModel}
            setActiveExplore={setActiveExplore}
            coreSDK={coreSDK}
          />
          <Divider mt="u4" appearance="light" />
          {isGettingExplore && (
            <Space justifyContent="center">
              <ProgressCircular />
            </Space>
          )}
          {!exploreIsValid ? (
            exploreIsValid === null ? (
              <div></div>
            ) : uidField.length !== 1 ? (
              <MessageBar intent="critical">
                Please ensure one and only one field in your model has the{' '}
                <Code>google-ads-uid</Code> tag.
              </MessageBar>
            ) : (
              <MessageBar intent="critical">
                No fields in your model were correctly tagged and named for the
                Google Ads Customer Match action.
              </MessageBar>
            )
          ) : (
            <Sidebar
              filters={filters.items}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />
          )}
          {errorGettingExplore && (
            <MessageBar intent="critical">
              There was an error retrieving the explore. Please check the
              console and/or try again.
            </MessageBar>
          )}
        </StyledSidebar>

        <div>
          <SegmentLogic
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            coreSDK={coreSDK}
          />
          <div>
            <h3>Results</h3>
            <table>
              <tr>
                {activeFilters && activeFilters.map((f) => <th>{f.label}</th>)}
              </tr>
            </table>
          </div>
        </div>

        <StyledRightSidebar width="324px" height="100%" align="start" p="large">
          <Button
            onClick={() => {
              setFrequency('once')
              handleRunButtonClick()
            }}
          >
            Run
          </Button>
        </StyledRightSidebar>
      </Space>
    </ComponentsProvider>
  )
})
