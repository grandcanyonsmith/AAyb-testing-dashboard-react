import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Changed to light theme
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import BackButton from '../components/BackButton';
import TabContainer from '../components/TabContainer';
import CodeContainer from '../components/CodeContainer';
import LogContainer from '../components/LogContainer';
import InputContainer from '../components/InputContainer';
import ErrorDisplay from '../components/ErrorDisplay';
import SidebarMenu from '../components/SidebarMenu';
import { useMediaQuery } from 'react-responsive';


const API_URLS = {
  submit: 'https://e5y4is5ldimrkhhl3wbiuv67gu0uzfea.lambda-url.us-west-2.on.aws/',
  execute: 'https://ajrpop5gpwumnljpyhl765znoa0yjbrn.lambda-url.us-west-2.on.aws/',
  fetchFileContents: 'https://dhcev3ep44ypxhhmgldoxly6dq0otbrp.lambda-url.us-west-2.on.aws/',
};

const LOADING_STATES = {
  idle: 'idle',
  submit: 'submit',
  execute: 'execute',
  fetchFileContents: 'fetchFileContents',
};

const initialState = {
  userRequest: '',
  code: '',
  testName: '',
  output: { stdout: '', stderr: '' },
  viewCode: true,
  loadingState: LOADING_STATES.idle,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'setUserRequest':
      return { ...state, userRequest: action.payload };
    case 'setCode':
      return { ...state, code: action.payload };
    case 'setTestName':
      return { ...state, testName: action.payload };
    case 'setOutput':
      return { ...state, output: action.payload };
      case 'toggleViewCode':
        return { ...state, viewCode: action.payload };
    case 'setLoadingState':
      return { ...state, loadingState: action.payload };
    case 'setError':
      return { ...state, error: action.payload };
    default:
      throw new Error();
  }
}

async function handleApiRequest(url, body) {
  try {
    const response = await axios.post(url, body);
    return response.data;
  } catch (error) {
    throw error;
  }
}

const ViewCode = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = useNavigate();
  const location = useLocation();
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1024px)' });
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    // This effect is no longer needed if we're keeping the sidebar closed initially
    // Remove or comment out this useEffect block
    // setSidebarOpen(isDesktopOrLaptop);
  }, [isDesktopOrLaptop]);


  // Use the state and dispatch to create handler functions
  const handleRequestChange = (e) => {
    dispatch({ type: 'setUserRequest', payload: e.target.value });
  };

  const handleSubmit = async () => {
    // Call the submitUserRequest function or any other logic you need
    await submitUserRequest();
  };

  const handleExecute = async () => {
    // Call the executeCode function or any other logic you need
    await executeCode();
  };
  useEffect(() => {
    let filePath = new URLSearchParams(location.search).get('testName');
    if (filePath) {
      filePath = filePath.split('.py')[0] + '.py'; // This will remove anything after .py
      console.log(filePath); // This will print the filePath to the console
      dispatch({ type: 'setTestName', payload: filePath });
      fetchFileContents(filePath);
    } else {
      console.error('File path not provided in the URL');
    }
  }, [location.search]);
  
  const fetchFileContents = async (filePath) => {
    dispatch({ type: 'setLoadingState', payload: LOADING_STATES.fetchFileContents });
    try {
      const data = await handleApiRequest(API_URLS.fetchFileContents, { filePath: filePath, requestType: 'FETCH_FILE_CONTENTS', branchName: 'main' });
      dispatch({ type: 'setCode', payload: data });
    } catch (error) {
      dispatch({ type: 'setError', payload: error });
    } finally {
      dispatch({ type: 'setLoadingState', payload: LOADING_STATES.idle });
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [state.code, state.output.stdout, state.output.stderr]);

  const handleUserRequestChange = (e) => {
    dispatch({ type: 'setUserRequest', payload: e.target.value });
  };

  const submitUserRequest = async () => {
    dispatch({ type: 'setLoadingState', payload: LOADING_STATES.submit });
    try {
      const data = await handleApiRequest(API_URLS.submit, { fileName: state.testName, request: state.userRequest, code: state.code });
      dispatch({ type: 'setCode', payload: data.newCode });
    } catch (error) {
      dispatch({ type: 'setError', payload: error });
    } finally {
      dispatch({ type: 'setLoadingState', payload: LOADING_STATES.idle });
    }
  };

  const executeCode = async () => {
    dispatch({ type: 'setLoadingState', payload: LOADING_STATES.execute });
    try {
      const requestBody = { filePath: state.testName, code: state.code };
      console.log('Sending request:', requestBody); // Log the request body
      const data = await handleApiRequest(API_URLS.execute, requestBody);
      console.log('Received response:', data); // Log the response data
      dispatch({ type: 'setOutput', payload: { stdout: data.StandardOutputContent, stderr: data.StandardErrorContent } });
      dispatch({ type: 'toggleViewCode', payload: false }); // Change the active tab to 'Logs'
    } catch (error) {
      dispatch({ type: 'setError', payload: error });
    } finally {
      dispatch({ type: 'setLoadingState', payload: LOADING_STATES.idle });
    }
  };

  const toggleViewCode = () => {
    dispatch({ type: 'toggleViewCode' });
  };

  const navigateBack = () => {
    const testName = new URLSearchParams(location.search).get('testName');
    navigate(`/RunDetails?testName=${encodeURIComponent(testName)}`);
  };

  const handlePullRequest = () => {
  console.log(state.code);
};

const toggleSidebar = () => {
  setSidebarOpen(!isSidebarOpen);
};

return (
  <div>
    <SidebarMenu className={`bg-gray-800 min-h-screen ${isSidebarOpen ? 'md:pl-64' : ''}`}isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
    <div className="ViewCode flex mx-auto max-w-7xl sm:px-6 lg:px-8">=
    <CodeContainer code={state.code} language="python" hidden={!state.viewCode} />
    <LogContainer stdout={state.output.stdout} stderr={state.output.stderr} hidden={state.viewCode} />
    <InputContainer
      state={state}
      requestText={state.userRequest}
      handleRequestChange={handleRequestChange}
      handleSubmit={handleSubmit}
      handleExecute={handleExecute}
      currentLoadingState={state.loadingState}
    />
    {state.error && <ErrorDisplay error={state.error} />}
  </div>
  </div>
);
};
export default ViewCode;




// // Object


// body: "{\"newCode\": \"Hello! I don't have feelings, but I'm here and ready to assist you. How can I help you today?\"}"

// statusCode: 200

// Object Prototype
// "data"


//after I click submit then just put the response in the code container box. right now its not populating after. the response is returned

