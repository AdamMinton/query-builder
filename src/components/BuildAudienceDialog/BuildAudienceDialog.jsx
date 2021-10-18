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
import React from 'react'
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
} from '@looker/components'

export const BuildAudienceDialog = ({ isOpen, setIsOpen }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      content={
        <DialogLayout
          header="A Dialog Example"
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
            <Paragraph>Select Destination and Get Form</Paragraph>
            <Select
              options={[
                { value: 'Foo', label: 'Foo' },
                { value: 'Bar', label: 'Bar' },
                { value: '123', label: '123' },
              ]}
              placeholder="Choose action"
            />
          </SpaceVertical>
        </DialogLayout>
      }
    />
  )
}

BuildAudienceDialog.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.bool,
}
