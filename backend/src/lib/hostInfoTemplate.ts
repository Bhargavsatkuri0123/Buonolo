// Generates the default "getting settled" content for a given (origin, host, city) combination.
// This ports the previous frontend-only TEMPLATE_HOST_INFO() generator so it runs server-side and can be
// cached/overridden — icon fields are lucide-react export names (strings), resolved to components client-side.
export function generateHostInfoTemplate(origin: string, city: string, host: string) {
  const q = encodeURIComponent(city);
  const qHost = encodeURIComponent(host);
  const qOrigin = encodeURIComponent(origin);

  return {
    welcomeMessage: `Welcome to ${city}! Getting settled in ${host} can be challenging, but we're here to help you every step of the way.`,
    emergency: [
      { label: "Police", num: "112" },
      { label: "Ambulance / Fire", num: "112" },
      { label: "Non-Emergency Medical", num: "116 117" },
    ],
    news: [
      { id: 1, tag: "Transport", title: `New public transport routes added in ${city}`, body: `The local transit authority has announced new routes to ease commuting for residents in ${city}.`, time: "2h ago" },
      { id: 2, tag: "Housing", title: "Rent control policies update", body: `Local authorities in ${host} are reviewing rent control measures to help newcomers and residents.`, time: "5h ago" },
      { id: 3, tag: "Community", title: `Annual Expat Meetup announced in ${city}`, body: "Join thousands of fellow expats at the biggest networking event of the year.", time: "1d ago" },
      { id: 4, tag: "Weather", title: "Upcoming weather advisory for the weekend", body: "Expect heavy rain and winds this weekend. Stay safe and plan indoors.", time: "2d ago" },
      { id: 5, tag: "Culture", title: "Free museum weekend", body: `Explore the rich history of ${city} with free access to major museums this weekend.`, time: "3d ago" },
    ],
    communities: [
      { name: `${city} Expats`, members: "12.4k", emoji: "🌍", joined: true },
      { name: `Tech in ${city}`, members: "8.2k", emoji: "💻", joined: false },
      { name: `Foodies of ${city}`, members: "3.1k", emoji: "🥑", joined: false },
      { name: "Hiking Enthusiasts", members: "1.5k", emoji: "🥾", joined: true },
      { name: "Language Exchange", members: "5.6k", emoji: "🗣️", joined: false },
    ],
    toolSections: [
      {
        label: "Emergency & Safety",
        items: [
          {
            name: "Emergency Numbers",
            desc: "Critical contacts for police, fire, and ambulance.",
            icon: "AlertTriangle",
            bg: "bg-red-500/10 dark:bg-red-500/20",
            gradient: "from-red-500 to-rose-600",
            color: "text-red-600 dark:text-red-400",
          },
        ],
      },
      {
        label: "Paperwork & Legal",
        items: [
          {
            name: "Registration",
            desc: "How to register your local address.",
            icon: "FileText",
            bg: "bg-orange-500/10 dark:bg-orange-500/20",
            gradient: "from-orange-400 to-amber-600",
            color: "text-orange-600 dark:text-orange-400",
            details: {
              steps: [
                { title: "Phase 1: Secure a Contract", desc: "You need a signed rental contract or 'Wohnungsgeberbestätigung' (Landlord confirmation).", links: [{ label: "Form Template (Doc)", url: "https://google.com/search?q=Wohnungsgeberbest%C3%A4tigung+template", type: "doc" }] },
                { title: "Phase 2: Book an Appointment", desc: "Visit the local citizen's office (Bürgeramt) website. Appointments book out weeks in advance, check early morning for cancellations.", links: [{ label: "Official Portal (Web)", url: `https://google.com/search?q=citizen+office+appointment+${q}`, type: "web" }] },
                { title: "Phase 3: Attend Appointment", desc: "Bring your passport, form, and landlord confirmation. The appointment usually takes 10 minutes." },
                { title: "Phase 4: Receive Tax ID", desc: "Your Tax ID will automatically be mailed to your new address within 2-4 weeks after registration." },
              ],
              groups: [`${city} Expats`],
            },
          },
          {
            name: "Passport & Embassy",
            desc: "Renew your passport, find your embassy, and handle consular services.",
            icon: "Globe",
            bg: "bg-blue-500/10 dark:bg-blue-500/20",
            gradient: "from-blue-500 to-indigo-600",
            color: "text-blue-600 dark:text-blue-400",
            details: {
              steps: [
                { title: "Phase 1: Find Your Embassy", desc: "Locate the nearest embassy or consulate for your home country.", links: [{ label: "Find Embassy (Map)", url: `https://www.google.com/maps/search/embassy+of+${qOrigin}+in+${q}`, type: "web" }] },
                { title: "Phase 2: Prepare Documents", desc: "Check your embassy's website for required documents (photos, forms, fees).", links: [{ label: "Embassy Services (Web)", url: `https://google.com/search?q=embassy+of+${qOrigin}+in+${qHost}+passport+renewal`, type: "web" }] },
                { title: "Phase 3: Book Appointment", desc: "Most embassies require prior appointments for passport renewals." },
                { title: "Phase 4: Processing Time", desc: "Expect 2-6 weeks for passport processing from abroad." },
              ],
              groups: [`${origin} Expats in ${host}`],
            },
          },
          {
            name: "Visas & Permits",
            desc: "Information on work and residence visas.",
            icon: "KeyRound",
            bg: "bg-blue-500/10 dark:bg-blue-500/20",
            gradient: "from-indigo-500 to-purple-600",
            color: "text-blue-600 dark:text-blue-400",
            details: {
              steps: [
                { title: "Phase 1: Identify Visa Type", desc: "Determine your visa type based on purpose (Blue Card, Work, Study, Freelance).", links: [{ label: "Gov Visa Portal (Web)", url: `https://google.com/search?q=visa+types+${qHost}`, type: "web" }] },
                { title: "Phase 2: Gather Documents", desc: "Prepare contracts, university degrees, biometric photos, and health insurance." },
                { title: "Phase 3: Book Appointment", desc: "Book an appointment at the Foreigners' Office (Ausländerbehörde) months in advance.", links: [{ label: "Immigration Office (Web)", url: `https://google.com/search?q=immigration+office+${q}`, type: "web" }] },
                { title: "Phase 4: Submit Application", desc: "Attend the appointment and pay the processing fee." },
              ],
              groups: [`Visa Help ${host}`],
            },
          },
          {
            name: "Legal Services",
            desc: "Find English-speaking lawyers for various matters.",
            icon: "Gavel",
            bg: "bg-slate-500/10 dark:bg-slate-500/20",
            gradient: "from-slate-600 to-slate-800",
            color: "text-slate-600 dark:text-slate-400",
            details: {
              steps: [
                { title: "Immigration Lawyers", desc: "Specialists in expat visas and residency.", links: [{ label: "Immigration Lawyers (Map)", url: `https://www.google.com/maps/search/immigration+lawyer+${q}`, type: "web" }] },
                { title: "Business & Tax Lawyers", desc: "Corporate legal counsel and tax advisors.", links: [{ label: "Corporate Lawyers (Map)", url: `https://www.google.com/maps/search/business+lawyer+${q}`, type: "web" }] },
                { title: "Real Estate Lawyers", desc: "Help with buying property or tenant rights.", links: [{ label: "Real Estate Lawyers (Map)", url: `https://www.google.com/maps/search/real+estate+lawyer+${q}`, type: "web" }] },
              ],
              groups: ["Expats Legal Advice"],
            },
          },
          {
            name: "Start a Business",
            desc: "Legal structures, registration, and tax info.",
            icon: "Briefcase",
            bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
            gradient: "from-emerald-500 to-teal-700",
            color: "text-emerald-600 dark:text-emerald-400",
            details: {
              steps: [
                { title: "Phase 1: Choose Legal Entity", desc: "Decide between Sole Trader, Partnership, or LLC equivalent.", links: [{ label: "Startup Guide (Video)", url: `https://www.youtube.com/results?search_query=start+business+in+${qHost}`, type: "video" }] },
                { title: "Phase 2: Trade Registration", desc: "Register your business at the local Trade Office (Gewerbeamt)." },
                { title: "Phase 3: Tax Registration", desc: "Submit the tax questionnaire (Fragebogen zur steuerlichen Erfassung) to get a VAT ID." },
                { title: "Phase 4: Open Business Bank Account", desc: "Keep personal and business finances strictly separated." },
              ],
              groups: [`${city} Entrepreneurs`],
            },
          },
        ],
      },
      {
        label: "Daily Life",
        items: [
          {
            name: "Banking",
            desc: "Setting up a local bank account.",
            icon: "CreditCard",
            bg: "bg-violet-500/10 dark:bg-violet-500/20",
            gradient: "from-violet-500 to-purple-600",
            color: "text-violet-600 dark:text-violet-400",
            details: {
              steps: [
                { title: "Phase 1: Compare Banks", desc: "Decide between traditional branch banks and mobile-first neo-banks like N26 or Revolut.", links: [{ label: "Best Banks (Video)", url: `https://www.youtube.com/results?search_query=best+banks+for+expats+${qHost}`, type: "video" }, { label: "Banking Guide (Web)", url: `https://google.com/search?q=open+bank+account+${qHost}`, type: "web" }] },
                { title: "Phase 2: Prepare Documents", desc: "You need a passport and an official registration certificate (Anmeldung)." },
                { title: "Phase 3: Verification", desc: "Complete the PostIdent (at the post office) or VideoIdent process to confirm your identity." },
              ],
            },
          },
          {
            name: "Housing & Utilities",
            desc: "Finding apartments and understanding contracts.",
            icon: "Building",
            bg: "bg-amber-500/10 dark:bg-amber-500/20",
            gradient: "from-amber-400 to-orange-600",
            color: "text-amber-600 dark:text-amber-400",
            details: {
              steps: [
                { title: "Phase 1: Rental Platforms", desc: "Search popular portals. Be prepared to set alerts and reply quickly.", links: [{ label: "Rental Sites Search", url: `https://google.com/search?q=apartments+for+rent+${q}`, type: "web" }] },
                { title: "Phase 2: Application Folder", desc: "Prepare a folder with passport copy, salary slips, and a credit score check." },
                { title: "Phase 3: Signing the Lease", desc: "Carefully read if there is a minimum rental period and understand the deposit rules." },
                { title: "Phase 4: Set up Utilities", desc: "Register for electricity, internet, and the mandatory TV/Radio tax." },
              ],
            },
          },
          {
            name: "Expat Grocery Stores",
            desc: "Find familiar ingredients and international food.",
            icon: "Store",
            bg: "bg-green-500/10 dark:bg-green-500/20",
            gradient: "from-green-500 to-emerald-600",
            color: "text-green-600 dark:text-green-400",
            details: {
              steps: [
                { title: "Asian Markets", desc: "Find Asian ingredients and snacks.", links: [{ label: "Asian Groceries (Map)", url: `https://www.google.com/maps/search/asian+grocery+store+${q}`, type: "web" }] },
                { title: "Middle Eastern Markets", desc: "Find Halal meat, spices and sweets.", links: [{ label: "Middle Eastern Groceries (Map)", url: `https://www.google.com/maps/search/middle+eastern+grocery+store+${q}`, type: "web" }] },
                { title: "Latin American Markets", desc: "Find masa, specific chilies and goods.", links: [{ label: "Latin Groceries (Map)", url: `https://www.google.com/maps/search/latin+american+grocery+store+${q}`, type: "web" }] },
                { title: "Eastern European Markets", desc: "Find imported goods from Eastern Europe.", links: [{ label: "Eastern European Groceries (Map)", url: `https://www.google.com/maps/search/eastern+european+grocery+store+${q}`, type: "web" }] },
              ],
            },
          },
          {
            name: "Public Transport",
            desc: "Navigating public transit and cycling.",
            icon: "Car",
            bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
            gradient: "from-cyan-500 to-blue-600",
            color: "text-cyan-600 dark:text-cyan-400",
            details: {
              steps: [
                { title: "Phase 1: Understand Tariff Zones", desc: "Learn the ABC zones in your city to buy the correct tickets." },
                { title: "Phase 2: Monthly Subscriptions", desc: "Consider a monthly transit pass. Look out for nationwide passes like the Deutschlandticket.", links: [{ label: "Transit Maps & Info (Web)", url: `https://google.com/search?q=public+transport+${q}`, type: "web" }] },
                { title: "Phase 3: Cycling Rules", desc: "Familiarize yourself with local cycling laws, designated paths, and hand signals." },
              ],
            },
          },
        ],
      },
      {
        label: "Health & Wellness",
        items: [
          {
            name: "Health Insurance",
            desc: "Choosing public or private health insurance.",
            icon: "Heart",
            bg: "bg-rose-500/10 dark:bg-rose-500/20",
            gradient: "from-rose-500 to-pink-600",
            color: "text-rose-600 dark:text-rose-400",
            details: {
              steps: [
                { title: "Phase 1: Public vs Private", desc: "Determine your eligibility. Public is income-based, private is risk-based." },
                { title: "Phase 2: Compare Providers", desc: "Research the major health funds (Krankenkassen).", links: [{ label: "Insurance Comparison (Web)", url: `https://google.com/search?q=health+insurance+comparison+${qHost}`, type: "web" }] },
                { title: "Phase 3: Enroll", desc: "Submit your application online. Your employer may require the certificate before your first day." },
              ],
            },
          },
          {
            name: "Finding a Doctor",
            desc: "How to find English-speaking doctors.",
            icon: "Stethoscope",
            bg: "bg-teal-500/10 dark:bg-teal-500/20",
            gradient: "from-teal-500 to-emerald-600",
            color: "text-teal-600 dark:text-teal-400",
            details: {
              steps: [
                { title: "Phase 1: Online Platforms", desc: "Use booking platforms like Doctolib to filter for doctors by language.", links: [{ label: "Book Doctors Online (Web)", url: `https://google.com/search?q=doctolib+${q}`, type: "web" }] },
                { title: "Phase 2: Find Specialists", desc: "Locate specific English-speaking specialists.", links: [{ label: "Specialists (Map)", url: `https://www.google.com/maps/search/english+speaking+doctor+${q}`, type: "web" }] },
                { title: "Phase 3: Out-of-Hours Care", desc: "Know the medical on-call service number (usually 116117)." },
              ],
            },
          },
          {
            name: "Gyms & Fitness",
            desc: "Local fitness centers, pools and sports clubs.",
            icon: "Dumbbell",
            bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
            gradient: "from-fuchsia-500 to-purple-600",
            color: "text-fuchsia-600 dark:text-fuchsia-400",
            details: {
              steps: [
                { title: "Gyms & Health Clubs", desc: "Look for fitness centers near you.", links: [{ label: "Nearby Gyms (Map)", url: `https://www.google.com/maps/search/gyms+${q}`, type: "web" }] },
                { title: "Yoga & Pilates", desc: "Find studios offering classes in English.", links: [{ label: "Yoga Studios (Map)", url: `https://www.google.com/maps/search/yoga+studio+${q}`, type: "web" }] },
                { title: "Swimming Pools", desc: "Public and private swimming pools.", links: [{ label: "Swimming Pools (Map)", url: `https://www.google.com/maps/search/swimming+pool+${q}`, type: "web" }] },
              ],
            },
          },
        ],
      },
      {
        label: "Education & Family",
        items: [
          {
            name: "Schools & Childcare",
            desc: "International schools, bilingual daycares.",
            icon: "BookOpen",
            bg: "bg-sky-500/10 dark:bg-sky-500/20",
            gradient: "from-sky-500 to-blue-600",
            color: "text-sky-600 dark:text-sky-400",
            details: {
              steps: [
                { title: "International Schools", desc: "Schools offering IB or foreign curricula.", links: [{ label: "International Schools (Map)", url: `https://www.google.com/maps/search/international+school+${q}`, type: "web" }] },
                { title: "Bilingual Kindergartens", desc: "Daycares offering multiple languages.", links: [{ label: "Bilingual Daycares (Map)", url: `https://www.google.com/maps/search/bilingual+kindergarten+${q}`, type: "web" }] },
                { title: "Kita Vouchers", desc: "Apply for a childcare voucher (Kita-Gutschein) from your local youth welfare office." },
              ],
            },
          },
          {
            name: "Universities & Colleges",
            desc: "Higher education, master's programs, research.",
            icon: "GraduationCap",
            bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
            gradient: "from-indigo-500 to-purple-600",
            color: "text-indigo-600 dark:text-indigo-400",
            details: {
              steps: [
                { title: "Public Universities", desc: "Often tuition-free, high quality education.", links: [{ label: "Universities (Map)", url: `https://www.google.com/maps/search/university+${q}`, type: "web" }] },
                { title: "Private Colleges", desc: "Often smaller classes, English programs.", links: [{ label: "Private Colleges (Map)", url: `https://www.google.com/maps/search/private+college+${q}`, type: "web" }] },
              ],
            },
          },
        ],
      },
      {
        label: "Community & Networking",
        items: [
          {
            name: "Professional Network",
            desc: "Connect with expats in your field.",
            icon: "Handshake",
            bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
            gradient: "from-zinc-500 to-slate-600",
            color: "text-zinc-600 dark:text-zinc-400",
            details: {
              steps: [
                { title: "Tech & Startup Networking", desc: "Meetups and events for tech professionals.", links: [{ label: "Tech Meetups (Web)", url: `https://google.com/search?q=tech+meetup+${q}`, type: "web" }] },
                { title: "Creative Professionals", desc: "Groups for designers, writers, and artists.", links: [{ label: "Creative Events (Web)", url: `https://google.com/search?q=creative+meetup+${q}`, type: "web" }] },
                { title: "Finance & Consulting", desc: "Networking for corporate expats.", links: [{ label: "Finance Meetups (Web)", url: `https://google.com/search?q=finance+meetup+${q}`, type: "web" }] },
              ],
              groups: [`Professionals in ${city}`],
            },
          },
          {
            name: "Places of Worship",
            desc: "Temples, Mosques, Churches and spiritual centers.",
            icon: "Church",
            bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
            gradient: "from-yellow-500 to-orange-500",
            color: "text-yellow-600 dark:text-yellow-400",
            details: {
              steps: [
                { title: "Christian Churches", desc: "Catholic, Protestant, Orthodox & more.", links: [{ label: "Churches (Map)", url: `https://www.google.com/maps/search/church+${q}`, type: "web" }] },
                { title: "Mosques & Islamic Centers", desc: "Find places for Jumu'ah and community.", links: [{ label: "Mosques (Map)", url: `https://www.google.com/maps/search/mosque+${q}`, type: "web" }] },
                { title: "Hindu Temples", desc: "Find mandirs for puja and festivals.", links: [{ label: "Hindu Temples (Map)", url: `https://www.google.com/maps/search/hindu+tempel+${q}`, type: "web" }] },
                { title: "Buddhist Temples", desc: "Find viharas and meditation centers.", links: [{ label: "Buddhist Temples (Map)", url: `https://www.google.com/maps/search/buddhist+tempel+${q}`, type: "web" }] },
                { title: "Synagogues", desc: "Find local Jewish community centers.", links: [{ label: "Synagogues (Map)", url: `https://www.google.com/maps/search/synagogue+${q}`, type: "web" }] },
              ],
            },
          },
          {
            name: "Language Exchange",
            desc: "Meet same-language speakers and locals.",
            icon: "MessageCircle",
            bg: "bg-orange-500/10 dark:bg-orange-500/20",
            gradient: "from-orange-500 to-amber-500",
            color: "text-orange-600 dark:text-orange-400",
            details: {
              steps: [{ title: "Find Meetups", desc: "Local groups to practice languages.", links: [{ label: "Language Exchange Events (Web)", url: `https://google.com/search?q=language+exchange+${q}`, type: "web" }] }],
            },
          },
          {
            name: "Community Centers",
            desc: "Local hubs for events, language exchange and meetups.",
            icon: "Users",
            bg: "bg-pink-500/10 dark:bg-pink-500/20",
            gradient: "from-pink-500 to-rose-500",
            color: "text-pink-600 dark:text-pink-400",
            details: {
              steps: [
                { title: "Language Exchange", desc: "Practice local language with native speakers.", links: [{ label: "Language Exchange (Web)", url: `https://google.com/search?q=language+exchange+${q}`, type: "web" }] },
                { title: "Cultural Institutes", desc: "Local organizations promoting culture and arts.", links: [{ label: "Cultural Centers (Map)", url: `https://www.google.com/maps/search/cultural+center+${q}`, type: "web" }] },
              ],
            },
          },
        ],
      },
    ],
  };
}
