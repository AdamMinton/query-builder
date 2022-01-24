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
  ButtonTransparent,
  SpaceVertical,
  FieldText,
  FieldSelect,
  ProgressCircular,
  Badge
} from '@looker/components'
import { StyledButton } from '../../App.styles'
import constants from '../../constants.js'


export const BuildAudienceDialog = ({ 
  isOpen,
  setIsOpen,
  actionFormFields,
  setActionFormFields,
  initActionFormParams,
  setGlobalActionFormParams,
  coreSDK,
  queryId,
  extensionSDK,
  getForm,
  isFormWorking,
  setIsFormWorking,
  wasActionSuccessful,
  setWasActionSuccessful,
  needsLogin,
  setNeedsLogin
}) => {

  const [localActionFormParams, setLocalActionFormParams] = useState(initActionFormParams)

  // checks login status to see if oauth has been achieved or not
  const checkLoginStatus = async () => {
    try {
      const form = await coreSDK.fetch_integration_form(constants.formDestination, {})
      return form.value.fields[0].name !== 'login'
    } catch (e) {
      console.log('Error checking login status', e)
      return false
    }
  }

  // function that runs when user is not authorized and oauth is required
  const loginManager = async () => {
    extensionSDK.openBrowserWindow(actionFormFields[0].oauth_url, "_blank");
    let loggedIn = false
    while (!loggedIn) {
      setTimeout(() => {console.log('Logged in yet?', loggedIn)}, 1000)
      loggedIn = await checkLoginStatus()
    }
    getForm()
  }
  
  // function that runs when choices are made in action form fields
  const onChangeFormSelectParams = (key, event, fieldType) => {
    const moreFieldsComing = actionFormFields[actionFormFields.length - 1].name !== 'doHashing';
    (fieldType !== 'text' && moreFieldsComing) && setIsFormWorking(true)
    // console.log('changing', key, event)
    // console.log('local action params', localActionFormParams)
    let params = JSON.parse(JSON.stringify(localActionFormParams));
    params[key] = fieldType === "text" ? event.target.value : event;
    setLocalActionFormParams(params);
    setGlobalActionFormParams(params);
  };
  
  // sends audience to Google Ads as a one-time build
  const submitForm = async () => {
    setIsFormWorking(true)
    const currentTimestamp = new Date(Date.now()).toLocaleString();
    const name = `Sent from Extension - ${currentTimestamp}`;
    const destination = `looker-integration://${constants.formDestination}`;

    try {
      const response = await coreSDK.scheduled_plan_run_once({
          name: name,
          query_id: queryId,
          scheduled_plan_destination: [
            {
              type: destination,
              format: "json_detail_lite_stream",
              parameters: JSON.stringify(localActionFormParams),
            },
          ],
          send_all_results: true
        })
      console.log('action response', response)
      setIsFormWorking(false)
      if (response.ok) {
        setWasActionSuccessful('yes')
      } else {
        setWasActionSuccessful('no')
      }
    } catch (e) {
      console.log('Error submitting form', e)
      setWasActionSuccessful('no')
    }
  };
  
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onAfterClose={() => {
        setActionFormFields([])
        setLocalActionFormParams({})
        setGlobalActionFormParams({})
        setIsFormWorking(false)
        setWasActionSuccessful('')
      }}
      content={
        <DialogLayout
          header="Google Ads Customer Match"
          footerSecondary={
            wasActionSuccessful === ''
              ? isFormWorking
                ? <ProgressCircular />
                : null
              : wasActionSuccessful === 'yes'
                ? <Badge intent="positive" size="large">Success!</Badge>
                : <Badge intent="negative" size="large">Sorry, Please Try Again</Badge>
          }
          footer={
            <DialogContext.Consumer>
              {({ closeModal }) => (
                <>
                  {  (isFormWorking || wasActionSuccessful === 'yes' || needsLogin)
                    ? <StyledButton disabled>Build Once</StyledButton>
                    : <StyledButton onClick={submitForm}>Build Once</StyledButton> 
                  }
                  { /* <StyledButton onClick={submitForm}>Build audience</StyledButton>*/ }
                  <ButtonTransparent onClick={closeModal} color="neutral">
                    {wasActionSuccessful === 'yes' ? 'Close' : 'Cancel'}
                  </ButtonTransparent>
                </>
              )}
            </DialogContext.Consumer>
          }
        >
        <SpaceVertical>
          { actionFormFields.map(field => {
            console.log('FIELD', field)
            if (field.type === "oauth_link" || field.type === "oauth_link_google") {
              setNeedsLogin(true)
              return (
                <>
                  <span>Please login to your Google account to continue.</span>
                  <StyledButton
                    key={actionFormFields[0].name}
                    value={localActionFormParams[actionFormFields[0].name]}
                    onClick={loginManager}
                  >
                    {actionFormFields[0].label}
                  </StyledButton>
                </>
              )
            } else if (field.type === "string" || field.type === "textarea" || field.type === null) {
              needsLogin && setNeedsLogin(false)
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
                  value={localActionFormParams[field.name]}
                />
              );
            } else if (field.type === "select") {
              needsLogin && setNeedsLogin(false)
              const formOptions = field.options.map(option => {
                return { value: option.name, label: option.label };
              });
              // console.log('select', formOptions)
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

BuildAudienceDialog.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  actionFormFields: PropTypes.array,
  initActionFormParams: PropTypes.object,
  setActionFormFields: PropTypes.func,
  setGlobalActionFormParams: PropTypes.func,
  coreSDK: PropTypes.object,
  queryId: PropTypes.number,
  extensionSDK: PropTypes.object,
  getForm: PropTypes.func,
  isFormWorking: PropTypes.bool,
  setIsFormWorking: PropTypes.func,
  wasActionSuccessful: PropTypes.string,
  setWasActionSuccessful: PropTypes.func,
  needsLogin: PropTypes.bool,
  setNeedsLogin: PropTypes.func
}
/*

Leaving these here for future refactoring efforts.  Generally the second response is what Looker sends when oauth is required but occasionally it's the first.
{
  "name": "login",
  "label": "Received error code 400 from the API, so your credentials have been discarded. Please reauthenticate and try again.",
  "description": "In order to send to this destination, you will need to log in once to your Google account.",
  "type": "oauth_link_google",
  "default": null,
  "oauth_url": "https://actions.looker.com/actions/google_ads_customer_match/oauth?state=10430227kFf1kIyCYKKVTciKtqfxgM4Kgjxi7En1X9un3qoXLRSw3ijU5d8Vp90N_IlLp_SEjvNnQXmSeT5fYc9qmQAR0iLQggOeBgW45sMFABYZpzzVwk86z_LoLY_qeshBwx8ihhvgePz1YosA4kN51MkLFJC1IzySMOIRUIddcIezjybUR-WyEQj1JH-KZZsYadcM7XMDPLenYpD54gl1vvm0",
  "interactive": false,
  "required": false,
  "options": null
}

{
  "name": "login",
  "label": "Log in",
  "description": "In order to send to this destination, you will need to log in once to your Google account.",
  "type": "oauth_link_google",
  "default": null,
  "oauth_url": "https://actions.looker.com/actions/google_ads_customer_match/oauth?state=1043022bHH8OzZbRYpkFsF7QsLDUAabK9WJnroDsDDrRqrC-283vEaaSNGOTJXXCxOhyawLUEbXFvTpqDR1577pMBrFYsofo3dqRaqq-qSABDCcnEnVCoFS4p_oU-lgTgNI38YKFzMvNGaC1PVbg_S8oWP1mXZFvT82BiXSNKKB0AKKmh7VBliTlqO4IAeS63KFCO4yHA6J5ogDK228NHZ9a009p",
  "interactive": false,
  "required": false,
  "options": null
}
*/
