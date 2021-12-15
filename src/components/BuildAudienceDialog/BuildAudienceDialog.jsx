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
  FieldSelect
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
  getForm
}) => {

  const [localActionFormParams, setLocalActionFormParams] = useState(actionInitFormParams)

  const onChangeFormSelectParams = (key, event, fieldType) => {
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
  getForm: PropTypes.func
}

/*
const [actionFormParams, setActionFormParams] = useState(
    props.actionInitFormParams
  );

  const onChangeFormSelectParams = (key: string, e: any, fieldType: string) => {
    let params = JSON.parse(JSON.stringify(actionFormParams));
    params[key] = fieldType === "text" ? e.target.value : e;
    setActionFormParams(params);
    props.setActionFormParams(params);
  };

  
  return (
    <>
      {props.actionFormFields.map((f: IDataActionFormField) => {
        // render string field(text or textarea)
        console.log(f)
        if (f.type === "string" || f.type === "textarea" || f.type === null) {
          return (
            <FieldText
              name={f.name}
              description={f.description}
              required={f.required}
              label={f.label}
              key={f.name}
              onChange={(e: any) =>
                onChangeFormSelectParams(f.name!, e, "text")
              }
              onBlur={f.interactive ? props.getForm : null}
              value={actionFormParams[f.name!]}
            />
          );

          // render select field
        } else if (f.type === "select") {
          const formOptions = f.options!.map((o) => {
            return { value: o.name, label: o.label };
          });

          return (
            <FieldSelect
              name={f.name}
              description={f.description}
              required={f.required}
              label={f.label}
              key={f.name}
              onChange={(e: string) =>
                onChangeFormSelectParams(f.name!, e, "select")
              }
              onBlur={f.interactive ? props.getForm : null}
              value={actionFormParams[f.name!]}
              options={formOptions}
              placeholder=""
              isClearable
            />
          );

          // show login button instead if user is not authenticated
        } else if (f.type === "oauth_link" || f.type === "oauth_link_google") {
          return (
            <Button
              key={f.name}
              value={actionFormParams[f.name!]}
              onClick={() => {
                extensionSDK.openBrowserWindow(f.oauth_url!, "_blank");
                setTimeout(props.getForm, 3000); // reload form after 3 seconds
              }}
            >
              {f.label}
            </Button>
          );
        }
      })}

      {/* hide send button if user is not authenticated */ /*}
      {props.actionFormFields[0].type === "oauth_link" ||
      props.actionFormFields[0].type === "oauth_link_google" ? (
        <Text>{props.actionFormFields[0].description}</Text>
      ) : (
        <FlexItem m="u3">
          <Button onClick={props.sendDestination}>Send to Action</Button>
        </FlexItem>
      )}
    </>
  );*/