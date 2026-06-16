import React, { useState, useEffect } from 'react';
import { Country, CommunityGroup, User } from '../types';
import { fetchCommunityData } from '../services/geminiService';
import { supabase } from '../services/supabase';

interface CommunityPageProps {
  country: Country;
  user: User | null;
  onAuthRedirect: () => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ country, user, onAuthRedirect }) => {
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [country]);

  const loadData = async () => {
    setLoading(true);
    try {
      const aiData = await fetchCommunityData(country.name);
      setEvents(aiData.events || []);

      const { data: groupsSnap } = await supabase.from('groups').select('*').order('created_at', { ascending: false });
      
      if (!groupsSnap) return;

      const realGroups = await Promise.all(groupsSnap.map(async (groupData) => {
        const { data: members } = await supabase.from('group_members').select('*').eq('group_id', groupData.id);
        const { data: updates } = await supabase.from('group_updates').select('*').eq('group_id', groupData.id);
        
        return {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          category: groupData.category,
          adminId: groupData.admin_id,
          adminName: groupData.admin_name,
          memberCount: (members || []).length,
          members: (members || []).map((m: any) => m.user_name),
          updates: (updates || []).map((u: any) => ({
             id: u.id,
             content: u.content,
             authorName: u.author_name,
             timestamp: u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
          })),
          isJoined: user ? (groupData.admin_id === user.id || (members || []).some((m: any) => m.user_id === user.id)) : false
        };
      }));

      setGroups(realGroups);
      if (selectedGroup) {
        setSelectedGroup(realGroups.find(rg => rg.id === selectedGroup.id) || null);
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const handleCreateRequest = () => { if (!user) onAuthRedirect(); else setIsCreating(true); };
  const handleJoinRequest = (group: CommunityGroup) => { if (!user) onAuthRedirect(); else toggleJoin(group); };

  const toggleJoin = async (group: CommunityGroup) => {
    if (!user || user.id === group.adminId) return;
    setActionLoading(true);
    try {
      if (group.isJoined) {
        await supabase.from('group_members').delete().match({ group_id: group.id, user_id: user.id });
      } else {
        await supabase.from('group_members').insert({
          group_id: group.id,
          user_id: user.id,
          user_name: user.name
        });
      }
      await loadData();
    } catch (err) {} finally { setActionLoading(false); }
  };

  if (loading) return <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 pb-20">
      {!selectedGroup && !isCreating && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div><h2 className="text-2xl font-black">Community Hub</h2><p className="text-slate-500">Connect in {country.name}</p></div>
          <div className="flex gap-4 w-full md:w-auto">
            <input type="text" placeholder="Find a community..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border rounded-xl px-4 py-2.5 text-xs font-bold flex-grow" />
            <button onClick={handleCreateRequest} className="px-6 py-2.5 bg-slate-900 text-white font-black rounded-xl text-xs whitespace-nowrap"><i className="fa-solid fa-plus mr-2"></i>Create Group</button>
          </div>
        </div>
      )}
      {!selectedGroup && !isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
            <div key={group.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col" onClick={() => setSelectedGroup(group)}>
              <div className="flex justify-between mb-4"><span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black">{group.category}</span><span className="text-[10px] text-slate-400">{group.memberCount} members</span></div>
              <h4 className="font-black text-slate-900 mb-2">{group.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-6">{group.description}</p>
              <div className="pt-4 border-t flex justify-between items-center"><button onClick={(e) => {e.stopPropagation(); handleJoinRequest(group);}} className="text-[10px] font-black uppercase text-blue-600">{group.isJoined ? 'Joined' : 'Join'}</button><span className="text-[10px] font-black uppercase text-slate-400">View <i className="fa-solid fa-chevron-right ml-1"></i></span></div>
            </div>
          ))}
        </div>
      )}
      {selectedGroup && (
        <div className="space-y-6">
          <button onClick={() => setSelectedGroup(null)} className="text-xs font-black text-slate-400"><i className="fa-solid fa-arrow-left mr-2"></i>Back</button>
          <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
            <h3 className="text-3xl font-black">{selectedGroup.name}</h3>
            <p className="text-slate-600 font-medium">{selectedGroup.description}</p>
            <button onClick={() => handleJoinRequest(selectedGroup)} disabled={actionLoading} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${selectedGroup.isJoined ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg'}`}>{selectedGroup.isJoined ? 'Joined' : 'Join Community'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;