import React from 'react';
import PropTypes from 'prop-types';

const LogContainer = ({ stdout, stderr, hidden }) => {
  return (
    <div className={`logContainer ${hidden ? 'hidden' : ''}`}>
      <pre className="line-numbers language-bash">
        <code>{stdout}</code>
      </pre>
      <pre className="line-numbers language-bash error">
        <code>{stderr}</code>
      </pre>
    </div>
  );
};

LogContainer.propTypes = {
  stdout: PropTypes.string.isRequired,
  stderr: PropTypes.string.isRequired,
  hidden: PropTypes.bool.isRequired,
};

export default LogContainer;