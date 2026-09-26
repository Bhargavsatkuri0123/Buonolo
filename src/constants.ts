import { Map, FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users, Building, Scale, BookOpen, GraduationCap, Store, Heart, Church, Dumbbell, AlertTriangle, MessageCircle, Gavel, Handshake, Globe, Target, Wrench, LucideIcon } from "lucide-react";

export const LOCATIONS: Record<string, string[]> = {
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Other"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Other"],
  "Austria": ["Vienna", "Graz", "Linz", "Salzburg", "Other"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Bruges", "Other"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Other"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Other"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Other"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Other"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Other"],
  "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Other"],
  "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Other"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Other"],
  "India": ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Other"],
  "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan", "Other"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway", "Other"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Other"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Other"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Other"],
  "Netherlands": ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Eindhoven", "Other"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Hamilton", "Other"],
  "Norway": ["Oslo", "Bergen", "Trondheim", "Stavanger", "Other"],
  "Poland": ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Other"],
  "Portugal": ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Other"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Other"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Other"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Other"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Other"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Lausanne", "Bern", "Other"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Other"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Other"],
  "United Kingdom": ["London", "Manchester", "Edinburgh", "Birmingham", "Glasgow", "Other"],
  "United States": ["New York", "San Francisco", "Austin", "Seattle", "Chicago", "Other"],
  "Other": ["Other"]
};

export const LANGS = ["English", "Deutsch", "हिन्दी", "Türkçe", "العربية", "Español", "Português", "Polski"];

// Maps a backend GoalTemplate's `iconName` to the matching lucide-react icon
// component, since the API only returns the name as a string.
export const GOAL_ICONS: Record<string, LucideIcon> = {
  FileText, KeyRound, CreditCard, Languages, Car, Briefcase, Stethoscope, Users, Wrench, Target
};

export const SAF = "linear-gradient(135deg,#FFB43A 0%,#FF8A00 55%,#F26A00 100%)";

export const TEMPLATE_HOST_INFO = (origin: string, city: string, host: string) => ({
  welcomeMessage: `Welcome to ${city}! Getting settled in ${host} can be challenging, but we're here to help you every step of the way.`,
  emergency: [
    { label: "Police", num: "112" },
    { label: "Ambulance / Fire", num: "112" },
    { label: "Non-Emergency Medical", num: "116 117" },
  ],
  news: [
    { 
      id: 1, 
      tag: "Transport", 
      title: `New public transport routes added in ${city}`, 
      body: `The local transit authority has announced new routes to ease commuting for residents in ${city}.`, 
      time: "2h ago",
      source: `${city} Metropolitan Transit Gazette`,
      author: "Lukas Becker · Urban Mobility Correspondent",
      readTime: "3 min read",
      url: `https://transit-news.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}.eu/network-expansion-2026`,
      highlights: [
        `Two new direct express lines link outer districts to the ${city} central business core.`,
        "Service frequency boosted to 4-minute intervals during morning and evening rush hours.",
        "New digital ticketing system now supports contactless payments and subsidized newcomer passes."
      ],
      content: [
        `Municipal transit officials in ${city} have officially cut the ribbon on an extensive transit network expansion designed to streamline daily commutes for thousands of working residents and newly arrived expatriates.`,
        `The investment introduces modern, low-emission rolling stock and two high-capacity transit branches connecting growing residential districts directly to major educational, medical, and commercial centers without requiring downtown transfers.`,
        `"Public transport is the lifeline of our community," stated the director of transport during this morning's press conference. "Our primary focus is ensuring that everyone, especially residents settling into new neighborhoods, can commute quickly, sustainably, and affordably."`,
        `Commuters can already plan journeys on the updated routes through the official transit app. In addition, registered city residents are eligible for monthly transit pass discounts upon presenting their local address registration.`
      ],
      advice: `Download the local ${city} transit app today to check updated live schedules. If you recently registered your residence, verify your eligibility for the local resident transit discount at central station service counters.`
    },
    { 
      id: 2, 
      tag: "Housing", 
      title: `Rent control policies and tenant rights update in ${host}`, 
      body: `Local authorities in ${host} are reviewing rent control measures to help newcomers and residents find stable homes.`, 
      time: "5h ago",
      source: `${host} Housing & Urban Development Monitor`,
      author: "Sarah Lindemann · Real Estate & Policy Analyst",
      readTime: "4 min read",
      url: `https://housing-watch.${host.toLowerCase().replace(/[^a-z0-9]/g, '')}.org/policy/rent-ceiling-reforms`,
      highlights: [
        `New legislation caps annual rent escalations in designated high-demand metropolitan zones like ${city}.`,
        "Standardized rental agreements now mandate transparent itemization of ancillary and heating utility charges.",
        "Expanded free legal counseling clinics launched for international tenants facing lease disputes."
      ],
      content: [
        `Legislators and tenant advocacy groups in ${host} have announced sweeping adjustments to tenant protection statutes, addressing soaring housing costs across major metropolitan regions including ${city}.`,
        `Under the updated policy guidelines, landlords will face stricter limits on permissible rent increments when establishing new leases, and mandatory transparency rules will require full disclosure of prior tenancy pricing.`,
        `Furthermore, security deposits are explicitly restricted to a maximum of three net monthly installments, payable across multiple months to ease financial pressure on newly arriving workers and families.`,
        `Tenant union representatives have praised the reforms while urging newcomers to review their contracts thoroughly before signing, and to utilize municipal rental index calculators to ensure legal compliance.`
      ],
      advice: `Never pay deposit funds in cash or before receiving a countersigned lease contract. In ${city}, you can consult local tenant associations (such as the tenant union) for contract verification before signing.`
    },
    { 
      id: 3, 
      tag: "Community", 
      title: `Annual International Expat Meetup & Welcome Fair announced in ${city}`, 
      body: `Join thousands of fellow expats, community ambassadors, and local cultural groups at the biggest networking event of the year.`, 
      time: "1d ago",
      source: `${city} International Community Hub`,
      author: "Carlos Mendez · Community Coordinator",
      readTime: "2 min read",
      url: `https://expat-summit.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}.org/events/annual-welcome-fair-2026`,
      highlights: [
        `Over 80 cultural associations, language exchange tables, and professional affinity networks participating.`,
        "Workshops on navigating local bureaucracy, tax basics, and career transition for international professionals.",
        "Free admission with live acoustic music, local food stalls, and family-friendly activities."
      ],
      content: [
        `The annual ${city} International Expat Fair has officially opened registration, bringing together thousands of residents from across the globe for a weekend of celebration, networking, and practical workshops.`,
        `Hosted at the city's central exhibition pavilion, the event features designated cultural zones, free introductory language crash courses, and interactive panels hosted by immigration counselors and experienced expat mentors.`,
        `Special breakout sessions will address topics such as securing healthcare coverage, converting driving permits, navigating child school enrollment, and discovering hidden neighborhood spots.`,
        `"Moving to a new country can feel daunting in the first few months. This fair is designed to show every newcomer that they are warmly welcomed and surrounded by a vibrant support network," said the event organizer.`
      ],
      advice: `RSVP early to secure workshop seating for the legal and career sessions. Bring a notebook and connect with local community group leaders in the Community tab right here in Meet Peanut!`
    },
    { 
      id: 4, 
      tag: "Weather", 
      title: `Upcoming weather advisory and seasonal climate guidance for ${city}`, 
      body: `Expect changing seasonal conditions and rain this weekend. Stay prepared with local weather tips and transport advice.`, 
      time: "2d ago",
      source: `National Meteorological Service · ${city} Bureau`,
      author: "Dr. Andrea Schmidt · Senior Meteorologist",
      readTime: "2 min read",
      url: `https://weather-forecast.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}.int/alerts/weekend-system-advisory`,
      highlights: [
        `Moderate to heavy precipitation expected beginning Friday evening through Sunday afternoon.`,
        `Temperatures forecast to dip 4–6°C below seasonal averages with gusty winds in exposed areas.`,
        "Municipal teams deployed to clear drainage systems and ensure smooth surface transit operations."
      ],
      content: [
        `Meteorological authorities have issued a regional weather alert for ${city} and neighboring districts ahead of a low-pressure frontal system moving across the territory.`,
        `Residents are advised to plan indoor activities for the weekend and anticipate minor schedule adjustments on outdoor regional train and ferry connections during the peak of the front.`,
        `Municipal heating services have commenced their seasonal transition, and apartment building managers are performing standard boiler maintenance checks to ensure reliable warm water and radiator operation throughout the colder period.`,
        `Emergency services remind cyclists and pedestrians to wear reflective clothing and equip bikes with compliant front and rear illumination during overcast daylight hours.`
      ],
      advice: `Keep a reliable waterproof jacket and portable umbrella handy. If you commute by bicycle in ${city}, ensure your front white light and rear red light are charged and functioning to avoid municipal fines.`
    },
    { 
      id: 5, 
      tag: "Culture", 
      title: `Free museum weekend and cultural access passes in ${city}`, 
      body: `Explore the rich history and vibrant arts scene of ${city} with free access to major municipal museums and heritage sites.`, 
      time: "3d ago",
      source: `${city} Department of Arts & Cultural Heritage`,
      author: "Sophie Laurent · Cultural Arts Writer",
      readTime: "3 min read",
      url: `https://culture.${city.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov/free-museum-weekend-initiative`,
      highlights: [
        `Free entry to more than 35 municipal art galleries, historical landmarks, and science museums.`,
        "Guided tours offered in English, Spanish, German, French, and Ukrainian throughout both days.",
        `Special cultural welcome discount card available for students, jobseekers, and newly registered citizens.`
      ],
      content: [
        `Culture lovers in ${city} are in for a treat as the municipal cultural ministry launches its flagship Museum Open Days initiative, welcoming the public into world-class exhibitions completely free of charge.`,
        `From modern art galleries and natural history archives to ancient historical collections, participating institutions will host special curator talks, interactive workshops, and architectural evening tours.`,
        `The initiative aims to democratize access to the city's rich heritage, making cultural exploration an effortless weekend leisure activity for both longtime residents and recent international arrivals.`,
        `"Art and history provide a universal bridge between communities," said the cultural affairs secretary. "We invite everyone to experience our shared spaces and discover the stories that shaped ${city}."`
      ],
      advice: `Book time-slot reservations online 24 to 48 hours in advance for top-tier venues to skip standby queues. Many museums offer audio guides in multiple languages via mobile QR codes.`
    }
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
      label: "Planning & Goals",
      items: [
        {
          name: "Roadmaps",
          desc: "View and manage your relocation roadmap and guided goals.",
          icon: Map,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          gradient: "from-blue-500 to-indigo-600",
          color: "text-blue-600 dark:text-blue-400"
        }
      ]
    },
    {
      label: "Emergency & Safety",
      items: [
        {
          name: "Emergency Numbers",
          desc: "Critical contacts for police, fire, and ambulance.",
          icon: AlertTriangle,
          bg: "bg-red-500/10 dark:bg-red-500/20",
          gradient: "from-red-500 to-rose-600",
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
          gradient: "from-orange-400 to-amber-600",
          color: "text-orange-600 dark:text-orange-400",
          details: {
            steps: [
              { title: "Phase 1: Secure a Contract", desc: "You need a signed rental contract or 'Wohnungsgeberbestätigung' (Landlord confirmation).", links: [{ label: "Form Template (Doc)", url: "https://google.com/search?q=Wohnungsgeberbest%C3%A4tigung+template", type: "doc" }] },
              { title: "Phase 2: Book an Appointment", desc: "Visit the local citizen's office (Bürgeramt) website. Appointments book out weeks in advance, check early morning for cancellations.", links: [{ label: "Official Portal (Web)", url: "https://google.com/search?q=citizen+office+appointment+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 3: Attend Appointment", desc: "Bring your passport, form, and landlord confirmation. The appointment usually takes 10 minutes." },
              { title: "Phase 4: Receive Tax ID", desc: "Your Tax ID will automatically be mailed to your new address within 2-4 weeks after registration." }
            ],
            groups: [`${city} Expats`]
          }
        },
        {
          name: "Passport & Embassy",
          desc: "Renew your passport, find your embassy, and handle consular services.",
          icon: Globe,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          gradient: "from-blue-500 to-indigo-600",
          color: "text-blue-600 dark:text-blue-400",
          details: {
            steps: [
              { title: "Phase 1: Find Your Embassy", desc: "Locate the nearest embassy or consulate for your home country.", links: [{ label: "Find Embassy (Map)", url: "https://www.google.com/maps/search/embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 2: Prepare Documents", desc: "Check your embassy's website for required documents (photos, forms, fees).", links: [{ label: "Embassy Services (Web)", url: "https://google.com/search?q=embassy+of+" + encodeURIComponent(origin) + "+in+" + encodeURIComponent(host) + "+passport+renewal", type: "web" }] },
              { title: "Phase 3: Book Appointment", desc: "Most embassies require prior appointments for passport renewals." },
              { title: "Phase 4: Processing Time", desc: "Expect 2-6 weeks for passport processing from abroad." }
            ],
            groups: [`${origin} Expats in ${host}`]
          }
        },
        { 
          name: "Visas & Permits", 
          desc: "Information on work and residence visas.",
          icon: KeyRound,
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          gradient: "from-indigo-500 to-purple-600",
          color: "text-blue-600 dark:text-blue-400",
          details: {
            steps: [
              { title: "Phase 1: Identify Visa Type", desc: "Determine your visa type based on purpose (Blue Card, Work, Study, Freelance).", links: [{ label: "Gov Visa Portal (Web)", url: "https://google.com/search?q=visa+types+" + encodeURIComponent(host), type: "web" }] },
              { title: "Phase 2: Gather Documents", desc: "Prepare contracts, university degrees, biometric photos, and health insurance." },
              { title: "Phase 3: Book Appointment", desc: "Book an appointment at the Foreigners' Office (Ausländerbehörde) months in advance.", links: [{ label: "Immigration Office (Web)", url: "https://google.com/search?q=immigration+office+" + encodeURIComponent(city), type: "web" }] },
              { title: "Phase 4: Submit Application", desc: "Attend the appointment and pay the processing fee." }
            ],
            groups: [`Visa Help ${host}`]
          }
        },
        {
          name: "Legal Services",
          desc: "Find English-speaking lawyers for various matters.",
          icon: Gavel,
          bg: "bg-slate-500/10 dark:bg-slate-500/20",
          gradient: "from-slate-600 to-slate-800",
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
          gradient: "from-emerald-500 to-teal-700",
          color: "text-emerald-600 dark:text-emerald-400",
          details: {
            steps: [
              { title: "Phase 1: Choose Legal Entity", desc: "Decide between Sole Trader, Partnership, or LLC equivalent.", links: [{ label: "Startup Guide (Video)", url: "https://www.youtube.com/results?search_query=start+business+in+" + encodeURIComponent(host), type: "video" }] },
              { title: "Phase 2: Trade Registration", desc: "Register your business at the local Trade Office (Gewerbeamt)." },
              { title: "Phase 3: Tax Registration", desc: "Submit the tax questionnaire (Fragebogen zur steuerlichen Erfassung) to get a VAT ID." },
              { title: "Phase 4: Open Business Bank Account", desc: "Keep personal and business finances strictly separated." }
            ],
            groups: [`${city} Entrepreneurs`]
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
          gradient: "from-violet-500 to-purple-600",
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
          gradient: "from-amber-400 to-orange-600",
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
          gradient: "from-green-500 to-emerald-600",
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
          gradient: "from-cyan-500 to-blue-600",
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
          gradient: "from-rose-500 to-pink-600",
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
          gradient: "from-teal-500 to-emerald-600",
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
          gradient: "from-fuchsia-500 to-purple-600",
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
          gradient: "from-sky-500 to-blue-600",
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
          gradient: "from-indigo-500 to-purple-600",
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
          gradient: "from-zinc-500 to-slate-600",
          color: "text-zinc-600 dark:text-zinc-400",
          details: {
            steps: [
              { title: "Tech & Startup Networking", desc: "Meetups and events for tech professionals.", links: [{ label: "Tech Meetups (Web)", url: "https://google.com/search?q=tech+meetup+" + encodeURIComponent(city), type: "web" }] },
              { title: "Creative Professionals", desc: "Groups for designers, writers, and artists.", links: [{ label: "Creative Events (Web)", url: "https://google.com/search?q=creative+meetup+" + encodeURIComponent(city), type: "web" }] },
              { title: "Finance & Consulting", desc: "Networking for corporate expats.", links: [{ label: "Finance Meetups (Web)", url: "https://google.com/search?q=finance+meetup+" + encodeURIComponent(city), type: "web" }] }
            ],
            groups: [`Professionals in ${city}`]
          }
        },
        {
          name: "Places of Worship",
          desc: "Temples, Mosques, Churches and spiritual centers.",
          icon: Church,
          bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
          gradient: "from-yellow-500 to-orange-500",
          color: "text-yellow-600 dark:text-yellow-400",
          details: {
            steps: [
              { title: "Christian Churches", desc: "Catholic, Protestant, Orthodox & more.", links: [{ label: "Churches (Map)", url: "https://www.google.com/maps/search/church+" + encodeURIComponent(city), type: "web" }] },
              { title: "Mosques & Islamic Centers", desc: "Find places for Jumu'ah and community.", links: [{ label: "Mosques (Map)", url: "https://www.google.com/maps/search/mosque+" + encodeURIComponent(city), type: "web" }] },
              { title: "Hindu Temples", desc: "Find mandirs for puja and festivals.", links: [{ label: "Hindu Temples (Map)", url: "https://www.google.com/maps/search/hindu+tempel+" + encodeURIComponent(city), type: "web" }] },
              { title: "Buddhist Temples", desc: "Find viharas and meditation centers.", links: [{ label: "Buddhist Temples (Map)", url: "https://www.google.com/maps/search/buddhist+tempel+" + encodeURIComponent(city), type: "web" }] },
              { title: "Synagogues", desc: "Find local Jewish community centers.", links: [{ label: "Synagogues (Map)", url: "https://www.google.com/maps/search/synagogue+" + encodeURIComponent(city), type: "web" }] }
            ]
          }
        },
        {
          name: "Language Exchange",
          desc: "Meet same-language speakers and locals.",
          icon: MessageCircle,
          bg: "bg-orange-500/10 dark:bg-orange-500/20",
          gradient: "from-orange-500 to-amber-500",
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
          gradient: "from-pink-500 to-rose-500",
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

  goals: [
    {
      id: "g1",
      title: "Register your address (Anmeldung)",
      cat: "Documentation",
      steps: [
        { t: "Book an appointment", d: "Find a slot at the local citizen's office.", done: true, tool: "Registration", links: [{ label: "Registration Guide (Video)", url: "https://www.youtube.com/results?search_query=how+to+register+address+" + encodeURIComponent(city), type: "video" }] },
        { t: "Prepare documents", d: "Gather passport, rental contract, and landlord confirmation.", done: true, tool: "Registration" },
        { t: "Attend appointment", d: "Go to the office and get your registration certificate.", done: false, tool: "Registration" }
      ]
    },
    {
      id: "g2",
      title: "Open a local bank account",
      cat: "Finance",
      steps: [
        { t: "Compare banks", d: "Look at traditional and digital banks (N26, Revolut).", done: false, tool: "Banking", links: [{ label: "Top Banks (Video)", url: "https://www.youtube.com/results?search_query=best+banks+" + encodeURIComponent(host), type: "video" }, { label: "Banking Guide (Web)", url: "https://google.com/search?q=open+bank+account+" + encodeURIComponent(host), type: "web" }] },
        { t: "Prepare documents", d: "You usually need your passport and registration certificate.", done: false, tool: "Banking" },
        { t: "Verify identity", d: "Complete the online or in-person verification process.", done: false, tool: "Banking" }
      ]
    },
    {
      id: "g3",
      title: "Sort out health insurance",
      cat: "Health",
      steps: [
        { t: "Public vs Private", d: "Understand your eligibility and pick the best system.", done: false, tool: "Health Insurance" },
        { t: "Compare funds", d: "Choose between TK, AOK, Barmer, etc.", done: false, tool: "Health Insurance" },
        { t: "Enroll & get card", d: "Submit your application and wait for your health insurance card.", done: false, tool: "Health Insurance" }
      ]
    },
    {
      id: "g4",
      title: "Get a local SIM card",
      cat: "Daily Life",
      steps: [
        { t: "Prepaid or Contract", d: "Decide whether you need a flexible prepaid plan or a long-term contract.", done: false, tool: null },
        { t: "Buy a SIM", d: "Purchase from a supermarket or a telecom store (Telekom, Vodafone, O2).", done: false, tool: null },
        { t: "Activate online", d: "Use the Video-Ident process to verify your identity and activate.", done: false, tool: null }
      ]
    }
  ]
});
