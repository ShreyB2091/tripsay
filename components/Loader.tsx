import React from 'react';

const Loader = () => {

  return (
    <div>
      <div className="modal modal-bottom modal-open">
        <div className="alert alert-info shadow-lg w-1/3 mb-10 m-auto">
          <div>
            <progress className="progress w-64"></progress>
            <span className="ml-12">Please wait ... Processing your query</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loader;