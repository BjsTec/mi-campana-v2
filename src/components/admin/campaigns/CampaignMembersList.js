// src/components/admin/campaigns/CampaignMembersList.js
import React, { useState } from 'react';
import MemberCard from '@/components/admin/campaigns/MemberCard';
import SearchInput from '@/components/ui/SearchInput';

const CampaignMembersList = ({ members, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(member => 
    member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-neutral-800 mb-4">Miembros de la Campaña</h2>
      <SearchInput
        placeholder="Buscar por nombre o rol"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {loading ? (
        <p>Cargando miembros...</p>
      ) : filteredMembers.length === 0 ? (
        <p className="text-center text-neutral-500 py-4">No se encontraron miembros para esta campaña.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map(member => (
            <MemberCard key={member.uid} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignMembersList;