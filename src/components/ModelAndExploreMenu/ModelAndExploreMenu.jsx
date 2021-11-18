import React from 'react'
import PropTypes from 'prop-types'
// import { StyledSidebar } from './Sidebar.styles'
import { FieldSelect } from '@looker/components'
// import { TreeButton } from './components/TreeButton'
import { ExtensionContext, ExtensionContextData } from "@looker/extension-sdk-react"

export const ModelAndExploreMenu = ({ topLevelChoices, setTopLevelChoices }) => {
  
  //Instantiate iframe dashboard via Extension Context (to obtain host) and Looker Embed SDK
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const extensionSDK = extensionContext.core40SDK
  const hostUrl = extensionContext?.extensionSDK?.lookerHostData?.hostUrl
  LookerEmbedSDK.init(hostUrl)
  
  const getList = async () => {
    const result = await extensionSDK.all_lookml_models()
    console.log(result)
    setTopLevelChoices([...result])
  }
  // const handleFilterClick = (filterItem) => {
  //   if (activeFilters.find((item) => item.id === filterItem.id)) {
  //     // Filter active - Remove from array
  //     activeFilters.splice(
  //       activeFilters.findIndex((item) => item.id === filterItem.id),
  //       1
  //     )
  //     setActiveFilters([...activeFilters])
  //   } else {
  //     // Add new filter to array
  //     setActiveFilters([...activeFilters, filterItem])
  //   }
  // }

  return (
    // <StyledSidebar>
    //   {filters.map((section) => (
    //     <TreeCollection key={section.id}>
    //       <Tree label={section.label} border>
    //         {section.items.map((filter) => {
    //           if (filter.items) {
    //             return (
    //               <Tree key={filter.id} label={filter.label}>
    //                 {filter.items.map((childFilter) => (
    //                   <TreeButton
    //                     key={childFilter.id}
    //                     item={childFilter}
    //                     onClick={handleFilterClick}
    //                     selected={
    //                       !!activeFilters.find(
    //                         (item) => item.id === childFilter.id
    //                       )
    //                     }
    //                   />
    //                 ))}
    //               </Tree>
    //             )
    //           }
    //           return (
    //             <TreeButton
    //               key={filter.id}
    //               item={filter}
    //               onClick={handleFilterClick}
    //               selected={
    //                 !!activeFilters.find((item) => item.id === filter.id)
    //               }
    //             />
    //           )
    //         })}
    //       </Tree>
    //     </TreeCollection>
    //   ))}
    // </StyledSidebar>
  )
}

ModelAndExploreMenu = {
  setTopLevelChoices: PropTypes.func,
  topLevelChoices: PropTypes.object,
}
