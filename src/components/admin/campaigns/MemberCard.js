// src/components/admin/campaigns/MemberCard.js
import React from 'react';
import Link from 'next/link';
import { UserIcon } from '@heroicons/react/24/outline';

const RoleBadge = ({ role }) => {
  const roleColors = {
    candidato: 'bg-indigo-100 text-indigo-800',
    manager: 'bg-blue-100 text-blue-800',
    anillo: 'bg-purple-100 text-purple-800',
    votante: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
      {role}
    </span>
  );
};

const MemberCard = ({ member }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-200">
      {member.photoURL ? (
        <img src={member.photoURL} alt={`Foto de ${member.displayName}`} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <UserIcon className="h-6 w-6 text-gray-500" />
        </div>
      )}
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{member.displayName}</h3>
        <RoleBadge role={member.role} />
      </div>
      <Link href={`/dashboard-admin/users/${member.uid}`} className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
        Ver Más
      </Link>
    </div>
  );
};

export default MemberCard;