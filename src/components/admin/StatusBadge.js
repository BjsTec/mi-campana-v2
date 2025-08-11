import React from 'react';

const StatusBadge = ({ status, role }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    public_lead: 'bg-yellow-100 text-yellow-800',
    manager: 'bg-indigo-100 text-indigo-800',
    votante: 'bg-blue-100 text-blue-800',
    anillo: 'bg-purple-100 text-purple-800',
    admin: 'bg-gray-100 text-gray-800'
  };
  const displayText = role || (status === 'public_lead' ? 'Lead' : status);
  const finalStatus = statusColors[role] || statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${finalStatus}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;