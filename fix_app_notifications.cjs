const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const target = `  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: "Welcome to Buonolo!", body: "We're here to help you settle in. Explore the roadmap to get started.", time: "Now", read: false, type: "system" },
    { id: 2, title: "Goal Update", body: "You've completed 2 steps in 'Register your address'. Keep going!", time: "2h ago", read: true, type: "goal" }
  ]);`;

const replacement = `  const [notifications, setNotifications] = useState<any[]>([]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error && data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        title: n.type === 'goal' ? 'Goal Update' : (n.type === 'system' ? 'System Notification' : 'Notification'),
        body: n.content,
        time: new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        read: n.is_read,
        type: n.type
      })));
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: \`user_id=eq.\${user.id}\` }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('App.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}
