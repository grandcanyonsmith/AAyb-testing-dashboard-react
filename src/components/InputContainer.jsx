import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Listbox, Transition } from '@headlessui/react';
import { PaperClipIcon, XIcon, ExclamationCircleIcon } from '@heroicons/react/solid';
import { Spinner, Tooltip, useToast } from '@chakra-ui/react';
import PullRequestButton from './PullRequestButton'

const LOADING_STATES = {
  idle: 'idle',
  submit: 'submit',
  execute: 'execute',
  fetchFileContents: 'fetchFileContents', // Add this line
};

const Button = ({ onClick, loadingState, children, buttonState, tooltip }) => (
  <Tooltip label={tooltip}>
    <button 
      onClick={onClick} 
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loadingState === buttonState ? 'opacity-50 cursor-not-allowed' : ''}`} 
      disabled={loadingState === buttonState}
      aria-label={buttonState}
      style={{ width: '100px', height: '40px' }} // Add this line
    >
      {loadingState === buttonState ? <Spinner size="xs" /> : children}
    </button>
  </Tooltip>
);

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  loadingState: PropTypes.string,
  children: PropTypes.node.isRequired,
  buttonState: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
};

const useKeydown = (key, callback) => {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === key) {
        callback(event);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [callback, key]);
};

const InputContainer = ({ state, requestText, handleRequestChange, handleSubmit, handleExecute, currentLoadingState, errorMessage }) => {

  const toast = useToast();

  const handleEnter = useCallback((event) => {
    if (event.metaKey) {
      if (event.shiftKey) {
        handleExecute(event);
      } else {
        handleSubmit(event);
      }
    }
  }, [handleExecute, handleSubmit]);

  useKeydown('Enter', handleEnter);

  useEffect(() => {
    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [errorMessage, toast]);

  return (
    <div className="flex items-start space-x-4 container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <form action="#" className="relative">
          <div className="overflow-hidden rounded-md shadow-sm ring-1 ring-inset ring-gray-300  focus-within:ring-indigo-600 container mx-auto px-4 sm:px-6 lg:px-8">
            <label htmlFor="comment" className="sr-only container mx-auto px-4 sm:px-6 lg:px-8">
              Add your comment
            </label>
            <textarea
  rows={3}
  name="comment"
  id="comment"
  className="block w-full resize-none border-0 bg-transparent py-2 text-white placeholder:text-gray-400 focus:outline-none  focus:ring-indigo-500 sm:text-sm sm:leading-6 "
  placeholder="Enter a Request... For example, 'GET /api/users'"
  value={requestText}
  onChange={handleRequestChange}
  aria-invalid={!!errorMessage}
/>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <div className="flex items-center space-x-5">
              <div className="flex items-center">
              <PullRequestButton
        code={state.code}
        testName={state.testName}
        // Pass any other required props
      />
              </div>
            </div>
            <div className="flex-shrink-0 space-x-2">
              <Button onClick={handleSubmit} loadingState={currentLoadingState} buttonState={LOADING_STATES.submit} tooltip="Submit the request">
                Submit
              </Button>
              <Button onClick={handleExecute} loadingState={currentLoadingState} buttonState={LOADING_STATES.execute} tooltip="Execute the request">
                Execute
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

InputContainer.propTypes = {
  currentLoadingState: PropTypes.oneOf(Object.values(LOADING_STATES)), // This will now include 'fetchFileContents'
  state: PropTypes.object.isRequired,
  requestText: PropTypes.string.isRequired,
  handleRequestChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleExecute: PropTypes.func.isRequired,
  currentLoadingState: PropTypes.oneOf(Object.values(LOADING_STATES)),
  errorMessage: PropTypes.string,
};

InputContainer.defaultProps = {
  currentLoadingState: LOADING_STATES.idle,
  errorMessage: null,
};

export default InputContainer;