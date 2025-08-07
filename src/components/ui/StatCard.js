// src/components/ui/StatCard.js
import React from 'react';

const StatCard = ({ title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800',
    green: 'bg-green-50 text-green-800',
    red: 'bg-red-50 text-red-800',
  };

  return (
    <div className={`p-4 rounded-xl shadow-md ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default StatCard;