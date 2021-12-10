import React from 'react'
import PropTypes from 'prop-types'
import { FieldSelect } from '@looker/components'

export const ModelAndExploreMenu = ({ models, explores, activeModel, setActiveModel, setActiveExplore }) => {
  
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
        onChange={async (event) => { setActiveExplore(event) }}
      />
    </div>
  )
}

ModelAndExploreMenu.propTypes = {
  models: PropTypes.array,
  explores: PropTypes.object,
  activeModel: PropTypes.string,
  setActiveModel: PropTypes.func,
  setActiveExplore: PropTypes.func
}
