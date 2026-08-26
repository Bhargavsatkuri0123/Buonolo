const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const target1 = `  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
    const channel = supabase.channel(\`realtime_group_updates_\${group.id}\`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_updates', filter: \`group_id=eq.\${group.id}\` }, () => {
        fetchUpdates();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [group.id]);`;

const replacement1 = `  const [posts, setPosts] = useState<any[]>([]);
  const [actualMembers, setActualMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchUpdates();
    fetchMembers();
    const channel = supabase.channel(\`realtime_group_updates_\${group.id}\`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_updates', filter: \`group_id=eq.\${group.id}\` }, () => {
        fetchUpdates();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [group.id]);

  const fetchMembers = async () => {
    const { data, error } = await supabase.from("group_members").select("user_id, profiles(full_name)").eq("group_id", group.id);
    if (!error && data) {
      setActualMembers(data.map((m: any) => ({
        id: m.user_id,
        name: m.profiles?.full_name || "User"
      })));
    }
  };`;

const target2 = `            <div className={\`p-2 rounded-xl border \${T.line} flex items-center gap-2 mb-2\`}>
              <Search size={16} className={T.sub} />
              <input type="text" placeholder="Find a member..." className={\`bg-transparent outline-none text-sm w-full \${T.text}\`} />
            </div>
            {DUMMY_PEOPLE.map(p => (
              <div key={p.id} onClick={() => onUserClick(p)} className="flex items-center gap-3 cursor-pointer">
                <Avatar name={p.name} />
                <div className="flex-1">
                  <p className={\`text-sm font-bold \${T.text}\`}>{p.name}</p>
                  <p className={\`text-xs \${T.sub}\`}>Joined recently</p>
                </div>
                <button className={\`p-2 rounded-full \${T.card2}\`}><UserPlus size={16} className={T.sub} /></button>
              </div>
            ))}`;

const replacement2 = `            <div className={\`p-2 rounded-xl border \${T.line} flex items-center gap-2 mb-2\`}>
              <Search size={16} className={T.sub} />
              <input type="text" placeholder="Find a member..." className={\`bg-transparent outline-none text-sm w-full \${T.text}\`} />
            </div>
            {actualMembers.map(p => (
              <div key={p.id} onClick={() => onUserClick(p)} className="flex items-center gap-3 cursor-pointer">
                <Avatar name={p.name} />
                <div className="flex-1">
                  <p className={\`text-sm font-bold \${T.text}\`}>{p.name}</p>
                  <p className={\`text-xs \${T.sub}\`}>Member</p>
                </div>
                <button className={\`p-2 rounded-full \${T.card2}\`}><UserPlus size={16} className={T.sub} /></button>
              </div>
            ))}`;

if (!code.includes(target1)) console.log("Target 1 not found");
if (!code.includes(target2)) console.log("Target 2 not found");
if (code.includes(target1) && code.includes(target2)) {
  code = code.replace(target1, replacement1);
  code = code.replace(target2, replacement2);
  fs.writeFileSync('src/components/CommunityTab.tsx', code);
  console.log("Replaced successfully!");
}
