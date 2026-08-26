const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const targetFetchFeed = `  const fetchFeed = async () => {
    if (!user) return;
    
    const [postsRes, profileRes, followsRes] = await Promise.all([`;
const replacementFetchFeed = `  const fetchFeed = async (origin?: string, city?: string, host?: string) => {
    if (!user) return;
    const o = origin || profile?.origin || "USA";
    const c = city || profile?.city || "Berlin";
    const h = host || profile?.host || "Germany";
    
    const [postsRes, profileRes, followsRes] = await Promise.all([`;

const targetSetFeed = `          bgTheme: p.bg_theme,
          attachment: p.attachment,
          saved: savedItems.includes(p.id),
          following: followingIds.includes(p.author_id)
        };
      }));
    }
  };`;
const replacementSetFeed = `          bgTheme: p.bg_theme,
          attachment: p.attachment,
          saved: savedItems.includes(p.id),
          following: followingIds.includes(p.author_id)
        };
      });
      const dummyPosts = GENERATE_DUMMY_FEED(o, c, h);
      setFeed([...dummyPosts, ...mappedPosts]);
    }
  };`;

const targetHandleUserChange = `        setUser(currentUser);
        fetchHostInfo(d.origin, d.host, d.city);
        fetchFeed();
        fetchGoals(currentUser.id);
        fetchGroups();
        fetchEvents();`;
const replacementHandleUserChange = `        setUser(currentUser);
        fetchHostInfo(d.origin, d.host, d.city);
        fetchFeed(d.origin, d.city, d.host);
        fetchGoals(currentUser.id);
        fetchGroups();
        fetchEvents(d.origin, d.city, d.host);`;

const targetHandleSetup = `      fetchHostInfo(origin, finalHost, finalCity);
      
      // Auto-create initial goal based on focus`;
const replacementHandleSetup = `      fetchHostInfo(origin, finalHost, finalCity);
      fetchFeed(origin, finalCity, finalHost);
      fetchGroups();
      fetchEvents(origin, finalCity, finalHost);
      
      // Auto-create initial goal based on focus`;

const targetRealtimePosts = `    const channel = supabase.channel('realtime_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchFeed();
      })`;
const replacementRealtimePosts = `    const channel = supabase.channel('realtime_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchFeed();
      })`;

if (code.includes(targetFetchFeed) && code.includes(targetSetFeed) && code.includes(targetHandleUserChange) && code.includes(targetHandleSetup)) {
  code = code.replace(targetFetchFeed, replacementFetchFeed);
  code = code.replace(targetSetFeed, replacementSetFeed);
  code = code.replace(targetHandleUserChange, replacementHandleUserChange);
  code = code.replace(targetHandleSetup, replacementHandleSetup);
  fs.writeFileSync('App.tsx', code);
  console.log("Replaced App successfully!");
} else {
  console.log("Targets not found in App!");
  if (!code.includes(targetFetchFeed)) console.log("t1 not found");
  if (!code.includes(targetSetFeed)) console.log("t2 not found");
  if (!code.includes(targetHandleUserChange)) console.log("t3 not found");
  if (!code.includes(targetHandleSetup)) console.log("t4 not found");
}

let code2 = fs.readFileSync('src/constants.ts', 'utf8');
const targetImport = `import { Target, AlertTriangle, FileText, Globe, Activity, Heart, Car, Map, Banknote, HelpCircle, Phone, Bus, Home, Stethoscope, Handshake, Church, MessageCircle, Users, GraduationCap, Briefcase, Languages, CreditCard, KeyRound } from "lucide-react";`;
const replacementImport = `import { Target, AlertTriangle, FileText, Globe, Activity, Heart, Car, Map, Banknote, HelpCircle, Phone, Bus, Home, Stethoscope, Handshake, Church, MessageCircle, Users, GraduationCap, Briefcase, Languages, CreditCard, KeyRound } from "lucide-react";\n\n`;
if (code2.includes(targetImport)) {
  code2 = code2.replace(targetImport, replacementImport);
}
fs.writeFileSync('src/constants.ts', code2);
