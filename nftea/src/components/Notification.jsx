import React from 'react';

const Notification = ({ message, isError = false }) => {
  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg max-w-sm 
      ${isError ? 'bg-red-600' : 'bg-green-600'} text-white flex items-center`}
    >
      <span className="mr-2">{isError ? '⚠️' : '✅'}</span>
      <p>{message}</p>
    </div>
  );
};

export default Notification;