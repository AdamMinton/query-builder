import React from 'react'
import PropTypes from 'prop-types'
import { LookerExtensionSDK, connectExtensionHost } from '@looker/extension-sdk'
import { FieldSelect } from '@looker/components'

export const ModelAndExploreMenu = ({ models, explores, activeModel, activeExplore, setActiveModel, setActiveExplore, setFilters, coreSDK, buildFilterMenu }) => {
  
  const buildFilterMenuHere = async () => {
    console.log('building-module')
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
    for (let category of ['dimensions','measures']) {
      fields[category].forEach(field => {
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

  return (
    <div>
      <FieldSelect
        name="Models"
        label="Models"
        placeholder="Choose a Model"
        options={models}
        onChange={(event) => { setActiveModel(event) }}
      />
      <FieldSelect
        name="Explores"
        label="Explores"
        placeholder="Choose an Explore"
        options={explores[activeModel]}
        onChange={async (event) => { setActiveExplore(event); await buildFilterMenu() }}
      />
    </div>
  )
}

ModelAndExploreMenu.propTypes = {
  models: PropTypes.array,
  explores: PropTypes.object,
  activeModel: PropTypes.string,
  activeExplore: PropTypes.string,
  setActiveModel: PropTypes.func,
  setActiveExplore: PropTypes.func,
  setFilters: PropTypes.func,
  coreSDK: PropTypes.object,
  buildFilterMenu: PropTypes.func
}
