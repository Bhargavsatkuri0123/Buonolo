const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

// replace lucide-react imports to add new ones
code = code.replace(
  'import { FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users } from "lucide-react";',
  'import { FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users, Building, Scale, BookOpen, GraduationCap, Store, Heart, Church, Dumbbell, AlertTriangle, MessageCircle, Gavel, Handshake } from "lucide-react";'
);

const newToolSections = `
  toolSections: [
    {
      label: "Emergency & Safety",
      items: [
        {
          name: "Emergency Numbers",
          desc: "Critical contacts for police, fire, and ambulance.",
          icon: AlertTriangle,
          bg: "bg-red-500/10 dark:bg-red-500/20",
          color: "text-red-600 dark:text-red-400"
        }
      ]
    },
    {
      label: "Paperwork & Legal",
      items: [
        { 
          name: "Registration", 
          desc: "How to register your local address.",
          icon: FileText,
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          color: "text-orange-600 dark:text-orange-400",
          details: {
            steps: [
              { title: "Book an Appointment", desc: "Visit the local citizen's office website and book an appointment online.", links: [{ label: "Official Portal (Web)", url: "https://google.com/search?q=citizen+office+appointment+" + encodeURIComponent(city), type: "web" }] },
              { title: "Attend Appointment", desc: "Bring your passport, form, and landlord confirmation." }
            ],
            groups: [\`\${city} Expats\`]
          }
        },
        { 
          name: "Visas & Permits", 
          desc: "Information on work and residence visas.",
          icon: KeyRound,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          color: "text-blue-600 dark:text-blue-400",
          details: {
            steps: [
              { title: "Identify Visa Type", desc: "Determine your visa type based on purpose.", links: [{ label: "Gov Visa Portal (Web)", url: "https://google.com/search?q=visa+types+" + encodeURIComponent(host), type: "web" }] },
              { title: "Submit Application", desc: "Apply at the local immigration office." }
            ],
            groups: [\`Visa Help \${host}\`]
          }
        },
        {
          name: "Legal Services",
          desc: "Find English-speaking lawyers for various matters.",
          icon: Gavel,
          bg: "bg-slate-500/10 dark:bg-slate-500/20",
          color: "text-slate-600 dark:text-slate-400",
          details: {
            steps: [
              { title: "Find Legal Counsel", desc: "Search directory of verified English-speaking legal professionals.", links: [{ label: "Lawyer Directory (Web)", url: "https://google.com/search?q=english+speaking+lawyer+" + encodeURIComponent(city), type: "web" }] }
            ],
            groups: ["Expats Legal Advice"]
          }
        },
        {
          name: "Start a Business",
          desc: "Legal structures, registration, and tax info.",
          icon: Briefcase,
          bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
          color: "text-emerald-600 dark:text-emerald-400",
          details: {
            steps: [
              { title: "Company Formation", desc: "Choose legal entity and register your business.", links: [{ label: "Startup Guide (Video)", url: "https://www.youtube.com/results?search_query=start+business+in+" + encodeURIComponent(host), type: "video" }] },
              { title: "Tax Registration", desc: "Get a business tax ID and VAT number." }
            ],
            groups: [\`\${city} Entrepreneurs\`]
          }
        }
      ]
    },
    {
      label: "Daily Life",
      items: [
        { 
          name: "Banking", 
          desc: "Setting up a local bank account.",
          icon: CreditCard,
          bg: "bg-violet-500/10 dark:bg-violet-500/20",
          color: "text-violet-600 dark:text-violet-400",
          details: {
            steps: [
              { title: "Choose a Bank", desc: "Compare digital and branch banks.", links: [{ label: "Best Banks (Video)", url: "https://www.youtube.com/results?search_query=best+banks+for+expats+" + encodeURIComponent(host), type: "video" }] }
            ]
          }
        },
        { 
          name: "Housing & Utilities", 
          desc: "Finding apartments and understanding contracts.",
          icon: Building,
          bg: "bg-amber-500/10 dark:bg-amber-500/20",
          color: "text-amber-600 dark:text-amber-400"
        },
        {
          name: "Expat Grocery Stores",
          desc: "Find familiar ingredients and international food.",
          icon: Store,
          bg: "bg-green-500/10 dark:bg-green-500/20",
          color: "text-green-600 dark:text-green-400",
          details: {
            steps: [
              { title: "Local International Markets", desc: "Search for specific cuisine stores nearby.", links: [{ label: "Find Groceries (Map)", url: "https://www.google.com/maps/search/international+grocery+store+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Public Transport",
          desc: "Navigating public transit and cycling.",
          icon: Car,
          bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
          color: "text-cyan-600 dark:text-cyan-400"
        }
      ]
    },
    {
      label: "Health & Wellness",
      items: [
        { 
          name: "Health Insurance", 
          desc: "Choosing public or private health insurance.",
          icon: Heart,
          bg: "bg-rose-500/10 dark:bg-rose-500/20",
          color: "text-rose-600 dark:text-rose-400"
        },
        { 
          name: "Finding a Doctor", 
          desc: "How to find English-speaking doctors.",
          icon: Stethoscope,
          bg: "bg-teal-500/10 dark:bg-teal-500/20",
          color: "text-teal-600 dark:text-teal-400"
        },
        {
          name: "Gyms & Fitness",
          desc: "Local fitness centers, pools and sports clubs.",
          icon: Dumbbell,
          bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
          color: "text-fuchsia-600 dark:text-fuchsia-400",
          details: {
            steps: [
              { title: "Find Gyms", desc: "Look for fitness centers near you.", links: [{ label: "Nearby Gyms (Map)", url: "https://www.google.com/maps/search/gyms+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        }
      ]
    },
    {
      label: "Education & Family",
      items: [
        {
          name: "Schools & Childcare",
          desc: "International schools, bilingual daycares.",
          icon: BookOpen,
          bg: "bg-sky-500/10 dark:bg-sky-500/20",
          color: "text-sky-600 dark:text-sky-400"
        },
        {
          name: "Universities & Colleges",
          desc: "Higher education, master's programs, research.",
          icon: GraduationCap,
          bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
          color: "text-indigo-600 dark:text-indigo-400"
        }
      ]
    },
    {
      label: "Community & Networking",
      items: [
        {
          name: "Professional Network",
          desc: "Connect with expats in your field.",
          icon: Handshake,
          bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
          color: "text-zinc-600 dark:text-zinc-400"
        },
        {
          name: "Places of Worship",
          desc: "Temples, Mosques, Churches and spiritual centers.",
          icon: Church,
          bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
          color: "text-yellow-600 dark:text-yellow-400",
          details: {
            steps: [
              { title: "Find Spiritual Centers", desc: "Locate places of worship for your faith.", links: [{ label: "Nearby Temples/Churches (Map)", url: "https://www.google.com/maps/search/places+of+worship+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Community Centers",
          desc: "Local hubs for events, language exchange and meetups.",
          icon: Users,
          bg: "bg-pink-500/10 dark:bg-pink-500/20",
          color: "text-pink-600 dark:text-pink-400"
        }
      ]
    }
  ],
`;

code = code.replace(/toolSections:\s*\[[\s\S]*?groups:\s*\[\`Expat Parents \$\{city\}\`,\s*\`Health & Wellbeing \$\{city\}\`\]\n\s*\}\n\s*\}\n\s*\]\n\s*\}\n\s*\],/, newToolSections);

fs.writeFileSync('src/constants.ts', code);
