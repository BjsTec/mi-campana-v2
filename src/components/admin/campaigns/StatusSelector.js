// src/components/admin/campaigns/StatusSelector.js
import React from 'react';

const StatusSelector = ({ options, ...props }) => {
  return (
    <select
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-gray-900"
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
};

export default StatusSelector;