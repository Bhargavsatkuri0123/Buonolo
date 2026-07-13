const fs = require('fs');

let code = fs.readFileSync('src/constants.ts', 'utf8');

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
              { title: "Phase 1: Secure a Contract", desc: "You need a signed rental contract or 'Wohnungsgeberbestätigung' (Landlord confirmation).", links: [{ label: "Form Template (Doc)", url: "https://google.com/search?q=Wohnungsgeberbest%C3%A4tigung+template", type: "doc" }] },
              { title: "Phase 2: Book an Appointment", desc: "Visit the local citizen's office (Bürgeramt) website. Appointments book out weeks in advance, check early morning for cancellations.", links: [{ label: "Official Portal (Web)", url: "https://google.com/search?q=citizen+office+appointment+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 3: Attend Appointment", desc: "Bring your passport, form, and landlord confirmation. The appointment usually takes 10 minutes." },
              { title: "Phase 4: Receive Tax ID", desc: "Your Tax ID will automatically be mailed to your new address within 2-4 weeks after registration." }
            ],
            groups: [\`\${city} Expats\`]
          }
        },
        {
          name: "Passport & Embassy",
          desc: "Renew your passport, find your embassy, and handle consular services.",
          icon: Globe,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          color: "text-blue-600 dark:text-blue-400",
          details: {
            steps: [
              { title: "Phase 1: Find Your Embassy", desc: "Locate the nearest embassy or consulate for your home country.", links: [{ label: "Find Embassy (Map)", url: "https://www.google.com/maps/search/embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 2: Prepare Documents", desc: "Check your embassy's website for required documents (photos, forms, fees).", links: [{ label: "Embassy Services (Web)", url: "https://google.com/search?q=embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(host) + "+passport+renewal", type: "web" }] },
              { title: "Phase 3: Book Appointment", desc: "Most embassies require prior appointments for passport renewals." },
              { title: "Phase 4: Processing Time", desc: "Expect 2-6 weeks for passport processing from abroad." }
            ],
            groups: [\`\${origin} Expats in \${host}\`]
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
              { title: "Phase 1: Identify Visa Type", desc: "Determine your visa type based on purpose (Blue Card, Work, Study, Freelance).", links: [{ label: "Gov Visa Portal (Web)", url: "https://google.com/search?q=visa+types+" + encodeURIComponent(host), type: "web" }] },
              { title: "Phase 2: Gather Documents", desc: "Prepare contracts, university degrees, biometric photos, and health insurance." },
              { title: "Phase 3: Book Appointment", desc: "Book an appointment at the Foreigners' Office (Ausländerbehörde) months in advance.", links: [{ label: "Immigration Office (Web)", url: "https://google.com/search?q=immigration+office+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 4: Submit Application", desc: "Attend the appointment and pay the processing fee." }
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
              { title: "Immigration Lawyers", desc: "Specialists in expat visas and residency.", links: [{ label: "Immigration Lawyers (Map)", url: "https://www.google.com/maps/search/immigration+lawyer+" + encodeURIComponent(city), type: "web" }] },
              { title: "Business & Tax Lawyers", desc: "Corporate legal counsel and tax advisors.", links: [{ label: "Corporate Lawyers (Map)", url: "https://www.google.com/maps/search/business+lawyer+" + encodeURIComponent(city), type: "web" }] },
              { title: "Real Estate Lawyers", desc: "Help with buying property or tenant rights.", links: [{ label: "Real Estate Lawyers (Map)", url: "https://www.google.com/maps/search/real+estate+lawyer+" + encodeURIComponent(city), type: "web" }] }
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
              { title: "Phase 1: Choose Legal Entity", desc: "Decide between Sole Trader, Partnership, or LLC equivalent.", links: [{ label: "Startup Guide (Video)", url: "https://www.youtube.com/results?search_query=start+business+in+" + encodeURIComponent(host), type: "video" }] },
              { title: "Phase 2: Trade Registration", desc: "Register your business at the local Trade Office (Gewerbeamt)." },
              { title: "Phase 3: Tax Registration", desc: "Submit the tax questionnaire (Fragebogen zur steuerlichen Erfassung) to get a VAT ID." },
              { title: "Phase 4: Open Business Bank Account", desc: "Keep personal and business finances strictly separated." }
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
              { title: "Phase 1: Compare Banks", desc: "Decide between traditional branch banks and mobile-first neo-banks like N26 or Revolut.", links: [{ label: "Best Banks (Video)", url: "https://www.youtube.com/results?search_query=best+banks+for+expats+" + encodeURIComponent(host), type: "video" }, { label: "Banking Guide (Web)", url: "https://google.com/search?q=open+bank+account+" + encodeURIComponent(host), type: "web" }] },
              { title: "Phase 2: Prepare Documents", desc: "You need a passport and an official registration certificate (Anmeldung)." },
              { title: "Phase 3: Verification", desc: "Complete the PostIdent (at the post office) or VideoIdent process to confirm your identity." }
            ]
          }
        },
        { 
          name: "Housing & Utilities", 
          desc: "Finding apartments and understanding contracts.",
          icon: Building,
          bg: "bg-amber-500/10 dark:bg-amber-500/20",
          color: "text-amber-600 dark:text-amber-400",
          details: {
            steps: [
              { title: "Phase 1: Rental Platforms", desc: "Search popular portals. Be prepared to set alerts and reply quickly.", links: [{ label: "Rental Sites Search", url: "https://google.com/search?q=apartments+for+rent+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 2: Application Folder", desc: "Prepare a folder with passport copy, salary slips, and a credit score check." },
              { title: "Phase 3: Signing the Lease", desc: "Carefully read if there is a minimum rental period and understand the deposit rules." },
              { title: "Phase 4: Set up Utilities", desc: "Register for electricity, internet, and the mandatory TV/Radio tax." }
            ]
          }
        },
        {
          name: "Expat Grocery Stores",
          desc: "Find familiar ingredients and international food.",
          icon: Store,
          bg: "bg-green-500/10 dark:bg-green-500/20",
          color: "text-green-600 dark:text-green-400",
          details: {
            steps: [
              { title: "Asian Markets", desc: "Find Asian ingredients and snacks.", links: [{ label: "Asian Groceries (Map)", url: "https://www.google.com/maps/search/asian+grocery+store+" + encodeURIComponent(city), type: "web" }] },
              { title: "Middle Eastern Markets", desc: "Find Halal meat, spices and sweets.", links: [{ label: "Middle Eastern Groceries (Map)", url: "https://www.google.com/maps/search/middle+eastern+grocery+store+" + encodeURIComponent(city), type: "web" }] },
              { title: "Latin American Markets", desc: "Find masa, specific chilies and goods.", links: [{ label: "Latin Groceries (Map)", url: "https://www.google.com/maps/search/latin+american+grocery+store+" + encodeURIComponent(city), type: "web" }] },
              { title: "Eastern European Markets", desc: "Find imported goods from Eastern Europe.", links: [{ label: "Eastern European Groceries (Map)", url: "https://www.google.com/maps/search/eastern+european+grocery+store+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Public Transport",
          desc: "Navigating public transit and cycling.",
          icon: Car,
          bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
          color: "text-cyan-600 dark:text-cyan-400",
          details: {
            steps: [
              { title: "Phase 1: Understand Tariff Zones", desc: "Learn the ABC zones in your city to buy the correct tickets." },
              { title: "Phase 2: Monthly Subscriptions", desc: "Consider a monthly transit pass. Look out for nationwide passes like the Deutschlandticket.", links: [{ label: "Transit Maps & Info (Web)", url: "https://google.com/search?q=public+transport+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 3: Cycling Rules", desc: "Familiarize yourself with local cycling laws, designated paths, and hand signals." }
            ]
          }
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
          color: "text-rose-600 dark:text-rose-400",
          details: {
            steps: [
              { title: "Phase 1: Public vs Private", desc: "Determine your eligibility. Public is income-based, private is risk-based." },
              { title: "Phase 2: Compare Providers", desc: "Research the major health funds (Krankenkassen).", links: [{ label: "Insurance Comparison (Web)", url: "https://google.com/search?q=health+insurance+comparison+" + encodeURIComponent(host), type: "web" }] },
              { title: "Phase 3: Enroll", desc: "Submit your application online. Your employer may require the certificate before your first day." }
            ]
          }
        },
        { 
          name: "Finding a Doctor", 
          desc: "How to find English-speaking doctors.",
          icon: Stethoscope,
          bg: "bg-teal-500/10 dark:bg-teal-500/20",
          color: "text-teal-600 dark:text-teal-400",
          details: {
            steps: [
              { title: "Phase 1: Online Platforms", desc: "Use booking platforms like Doctolib to filter for doctors by language.", links: [{ label: "Book Doctors Online (Web)", url: "https://google.com/search?q=doctolib+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 2: Find Specialists", desc: "Locate specific English-speaking specialists.", links: [{ label: "Specialists (Map)", url: "https://www.google.com/maps/search/english+speaking+doctor+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 3: Out-of-Hours Care", desc: "Know the medical on-call service number (usually 116117)." }
            ]
          }
        },
        {
          name: "Gyms & Fitness",
          desc: "Local fitness centers, pools and sports clubs.",
          icon: Dumbbell,
          bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
          color: "text-fuchsia-600 dark:text-fuchsia-400",
          details: {
            steps: [
              { title: "Gyms & Health Clubs", desc: "Look for fitness centers near you.", links: [{ label: "Nearby Gyms (Map)", url: "https://www.google.com/maps/search/gyms+" + encodeURIComponent(city), type: "web" }] },
              { title: "Yoga & Pilates", desc: "Find studios offering classes in English.", links: [{ label: "Yoga Studios (Map)", url: "https://www.google.com/maps/search/yoga+studio+" + encodeURIComponent(city), type: "web" }] },
              { title: "Swimming Pools", desc: "Public and private swimming pools.", links: [{ label: "Swimming Pools (Map)", url: "https://www.google.com/maps/search/swimming+pool+" + encodeURIComponent(city), type: "web" }] }
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
          color: "text-sky-600 dark:text-sky-400",
          details: {
            steps: [
              { title: "International Schools", desc: "Schools offering IB or foreign curricula.", links: [{ label: "International Schools (Map)", url: "https://www.google.com/maps/search/international+school+" + encodeURIComponent(city), type: "web" }] },
              { title: "Bilingual Kindergartens", desc: "Daycares offering multiple languages.", links: [{ label: "Bilingual Daycares (Map)", url: "https://www.google.com/maps/search/bilingual+kindergarten+" + encodeURIComponent(city), type: "web" }] },
              { title: "Kita Vouchers", desc: "Apply for a childcare voucher (Kita-Gutschein) from your local youth welfare office." }
            ]
          }
        },
        {
          name: "Universities & Colleges",
          desc: "Higher education, master's programs, research.",
          icon: GraduationCap,
          bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
          color: "text-indigo-600 dark:text-indigo-400",
          details: {
            steps: [
              { title: "Public Universities", desc: "Often tuition-free, high quality education.", links: [{ label: "Universities (Map)", url: "https://www.google.com/maps/search/university+" + encodeURIComponent(city), type: "web" }] },
              { title: "Private Colleges", desc: "Often smaller classes, English programs.", links: [{ label: "Private Colleges (Map)", url: "https://www.google.com/maps/search/private+college+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
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
          color: "text-zinc-600 dark:text-zinc-400",
          details: {
            steps: [
              { title: "Tech & Startup Networking", desc: "Meetups and events for tech professionals.", links: [{ label: "Tech Meetups (Web)", url: "https://google.com/search?q=tech+meetup+" + encodeURIComponent(city), type: "web" }] },
              { title: "Creative Professionals", desc: "Groups for designers, writers, and artists.", links: [{ label: "Creative Events (Web)", url: "https://google.com/search?q=creative+meetup+" + encodeURIComponent(city), type: "web" }] },
              { title: "Finance & Consulting", desc: "Networking for corporate expats.", links: [{ label: "Finance Meetups (Web)", url: "https://google.com/search?q=finance+meetup+" + encodeURIComponent(city), type: "web" }] }
            ],
            groups: [\`Professionals in \${city}\`]
          }
        },
        {
          name: "Places of Worship",
          desc: "Temples, Mosques, Churches and spiritual centers.",
          icon: Church,
          bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
          color: "text-yellow-600 dark:text-yellow-400",
          details: {
            steps: [
              { title: "Christian Churches", desc: "Catholic, Protestant, Orthodox & more.", links: [{ label: "Churches (Map)", url: "https://www.google.com/maps/search/church+" + encodeURIComponent(city), type: "web" }] },
              { title: "Mosques & Islamic Centers", desc: "Find places for Jumu'ah and community.", links: [{ label: "Mosques (Map)", url: "https://www.google.com/maps/search/mosque+" + encodeURIComponent(city), type: "web" }] },
              { title: "Hindu Temples", desc: "Find mandirs for puja and festivals.", links: [{ label: "Hindu Temples (Map)", url: "https://www.google.com/maps/search/hindu+temple+" + encodeURIComponent(city), type: "web" }] },
              { title: "Buddhist Temples", desc: "Find viharas and meditation centers.", links: [{ label: "Buddhist Temples (Map)", url: "https://www.google.com/maps/search/buddhist+temple+" + encodeURIComponent(city), type: "web" }] },
              { title: "Synagogues", desc: "Find local Jewish community centers.", links: [{ label: "Synagogues (Map)", url: "https://www.google.com/maps/search/synagogue+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Language Exchange",
          desc: "Meet same-language speakers and locals.",
          icon: MessageCircle,
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          color: "text-orange-600 dark:text-orange-400",
          details: {
            steps: [
              { title: "Find Meetups", desc: "Local groups to practice languages.", links: [{ label: "Language Exchange Events (Web)", url: "https://google.com/search?q=language+exchange+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Community Centers",
          desc: "Local hubs for events, language exchange and meetups.",
          icon: Users,
          bg: "bg-pink-500/10 dark:bg-pink-500/20",
          color: "text-pink-600 dark:text-pink-400",
          details: {
            steps: [
              { title: "Language Exchange", desc: "Practice local language with native speakers.", links: [{ label: "Language Exchange (Web)", url: "https://google.com/search?q=language+exchange+" + encodeURIComponent(city), type: "web" }] },
              { title: "Cultural Institutes", desc: "Local organizations promoting culture and arts.", links: [{ label: "Cultural Centers (Map)", url: "https://www.google.com/maps/search/cultural+center+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        }
      ]
    }
  ],
`;

code = code.replace(/toolSections:\s*\[[\s\S]*?\]\n\s*\}\n\s*\],\n\n\s*goals:/, newToolSections + '\n\n  goals:');

fs.writeFileSync('src/constants.ts', code);
