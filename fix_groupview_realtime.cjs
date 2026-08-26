const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const target = `  useEffect(() => {
    fetchUpdates();
  }, [group.id]);`;

const replacement = `  useEffect(() => {
    fetchUpdates();
    const channel = supabase.channel(\`realtime_group_updates_\${group.id}\`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_updates', filter: \`group_id=eq.\${group.id}\` }, () => {
        fetchUpdates();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [group.id]);`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('src/components/CommunityTab.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}
