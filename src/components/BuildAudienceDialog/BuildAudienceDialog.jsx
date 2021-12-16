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
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Dialog,
  DialogLayout,
  DialogContext,
  Button,
  ButtonTransparent,
  SpaceVertical,
  Paragraph,
  Select,
  FieldText,
  FieldSelect,
  ProgressCircular
} from '@looker/components'
import constants from '../../constants.js'


export const BuildAudienceDialog = ({ 
  isOpen,
  setIsOpen,
  actionFormFields,
  actionInitFormParams,
  setGlobalActionFormParams,
  coreSDK,
  queryId,
  needsOauth,
  extensionSDK,
  getForm,
  isFormWorking,
  setIsFormWorking
}) => {

  const [localActionFormParams, setLocalActionFormParams] = useState(actionInitFormParams)

  const onChangeFormSelectParams = (key, event, fieldType) => {
    setIsFormWorking(true)
    console.log('changing', key, event)
    console.log('local action params', localActionFormParams)
    let params = JSON.parse(JSON.stringify(localActionFormParams));
    params[key] = fieldType === "text" ? event.target.value : event;
    setLocalActionFormParams(params);
    setGlobalActionFormParams(params);
  };
  
  const submitForm = async () => {
    const currentTimestamp = new Date(Date.now()).toLocaleString();
    const name = `Sent from Extension - ${currentTimestamp}`;
    const destination = `looker-integration://${constants.formDestination}`;

    try {
      await coreSDK.scheduled_plan_run_once({
          name: name,
          query_id: queryId,
          scheduled_plan_destination: [
            {
              type: destination,
              format: "json_detail_lite_stream",
              parameters: JSON.stringify(actionFormParams),
            },
          ],
        })
    } catch (e) {
      console.log(e);
    }
  };
  
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      content={
        <DialogLayout
          header="Google Ads Customer"
          footerSecondary={ isFormWorking ? <ProgressCircular /> : null }
          footer={
            <DialogContext.Consumer>
              {({ closeModal }) => (
                <>
                  <Button onClick={closeModal}>Build audience</Button>
                  <ButtonTransparent onClick={closeModal} color="neutral">
                    Cancel
                  </ButtonTransparent>
                </>
              )}
            </DialogContext.Consumer>
          }
        >
        <SpaceVertical>
          { actionFormFields.map(field => {
            if (field.type === "oauth_link" || field.type === "oauth_link_google") {
              return (
                <Button
                  key={actionFormFields[0].name}
                  value={localActionFormParams[actionFormFields[0].name]}
                  onClick={() => {
                    extensionSDK.openBrowserWindow(actionFormFields[0].oauth_url, "_blank");
                    setTimeout(getForm, 3000); // reload form after 3 seconds
                  }}
                >
                  {actionFormFields[0].label}
                </Button>
              )
            } else if (field.type === "string" || field.type === "textarea" || field.type === null) {
                return (
                  <FieldText
                    name={field.name}
                    description={field.description}
                    required={field.required}
                    label={field.label}
                    key={field.name}
                    onChange={event =>
                      onChangeFormSelectParams(field.name, event, "text")
                    }
                    onBlur={field.interactive ? getForm : null}
                    value={localActionFormParams[field.name]}
                  />
                );
      
                // render select field
              } else if (field.type === "select") {
                const formOptions = field.options.map(option => {
                  return { value: option.name, label: option.label };
                });
                console.log('select', formOptions)
                return (
                  <FieldSelect
                    name={field.name}
                    description={field.description}
                    required={field.required}
                    label={field.label}
                    key={field.name}
                    onChange={event =>
                      onChangeFormSelectParams(field.name, event, "select")
                    }
                    onBlur={field.interactive ? getForm : null}
                    value={localActionFormParams[field.name]}
                    options={formOptions}
                    placeholder=""
                    isClearable
                  />
                );
              }
            })
          }
        </SpaceVertical>
        </DialogLayout>
      }
    />
  )

}
  
          
          
          
          // <Paragraph>Select Destination and Get Form</Paragraph>
          // <Select
          //   options={[
          //     { value: 'Foo', label: 'Foo' },
          //     { value: 'Bar', label: 'Bar' },
          //     { value: '123', label: '123' },
          //   ]}
          //   placeholder="Choose action"
          // />

//       }
//     />
//   )
// }

BuildAudienceDialog.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  actionFormFields: PropTypes.array,
  actionInitFormParams: PropTypes.object,
  setGlobalActionFormParams: PropTypes.func,
  coreSDK: PropTypes.object,
  queryId: PropTypes.number,
  needsOauth: PropTypes.bool,
  extensionSDK: PropTypes.object,
  getForm: PropTypes.func,
  isFormWorking: PropTypes.bool,
  setIsFormWorking: PropTypes.func
}
