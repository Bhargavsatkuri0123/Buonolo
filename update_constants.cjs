const fs = require('fs');

const path = 'src/constants.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `export const TEMPLATE_HOST_INFO = (origin: string, city: string, host: string) => ({
  welcomeMessage: \`Welcome to \${city}! Getting settled in \${host} can be challenging, but we're here to help you every step of the way.\`,
  emergency: [
    { label: "Police", num: "112" },
    { label: "Ambulance / Fire", num: "112" },
    { label: "Non-Emergency Medical", num: "116 117" },
  ],
  news: [
    { id: 1, tag: "Transport", title: \`New public transport routes added in \${city}\`, body: \`The local transit authority has announced new routes to ease commuting for residents in \${city}.\`, time: "2h ago" },
    { id: 2, tag: "Housing", title: "Rent control policies update", body: \`Local authorities in \${host} are reviewing rent control measures to help newcomers and residents.\`, time: "5h ago" },
    { id: 3, tag: "Community", title: \`Annual Expat Meetup announced in \${city}\`, body: "Join thousands of fellow expats at the biggest networking event of the year.", time: "1d ago" },
    { id: 4, tag: "Weather", title: "Upcoming weather advisory for the weekend", body: "Expect heavy rain and winds this weekend. Stay safe and plan indoors.", time: "2d ago" },
    { id: 5, tag: "Culture", title: "Free museum weekend", body: \`Explore the rich history of \${city} with free access to major museums this weekend.\`, time: "3d ago" }
  ],
  communities: [
    { name: \`\${city} Expats\`, members: "12.4k", emoji: "🌍", joined: true },
    { name: \`Tech in \${city}\`, members: "8.2k", emoji: "💻", joined: false },
    { name: \`Foodies of \${city}\`, members: "3.1k", emoji: "🥑", joined: false },
    { name: "Hiking Enthusiasts", members: "1.5k", emoji: "🥾", joined: true },
    { name: "Language Exchange", members: "5.6k", emoji: "🗣️", joined: false },
  ],
  toolSections: [
    {
      label: "Paperwork & Legal",
      items: [
        { 
          name: "Registration", 
          desc: "How to register your local address.",
          details: {
            steps: [
              { title: "Book an Appointment", desc: "Visit the local citizen's office website and book an appointment online. Do this early as slots fill up quickly." },
              { title: "Fill the Form", desc: "Download the registration form (Anmeldung) and fill it out completely." },
              { title: "Get Landlord Confirmation", desc: "Obtain the Wohnungsgeberbestätigung from your landlord." },
              { title: "Attend Appointment", desc: "Bring your passport, form, and landlord confirmation to the appointment." }
            ],
            groups: [\`\${city} Expats\`, \`Housing Support \${city}\`]
          }
        },
        { 
          name: "Visas & Permits", 
          desc: "Information on work and residence visas.",
          details: {
            steps: [
              { title: "Identify Visa Type", desc: "Determine whether you need a Blue Card, Work Visa, or Student Visa based on your purpose." },
              { title: "Gather Documents", desc: "Prepare your passport, contract, degree certificates, and health insurance." },
              { title: "Submit Application", desc: "Apply at the local immigration office (Ausländerbehörde) or via your embassy." }
            ],
            groups: [\`Visa Help \${host}\`, "Expats Legal Advice"]
          }
        },
        { 
          name: "Driving License", 
          desc: "Convert or apply for a local driving license.",
          details: {
            steps: [
              { title: "Check Reciprocity", desc: "Verify if your home country's license can be converted without a test." },
              { title: "Translate License", desc: "If applicable, get an official translation of your existing license." },
              { title: "Eye Test & First Aid", desc: "Complete an eye test and a mandatory first-aid course." },
              { title: "Apply at Office", desc: "Submit your application to the local driving license authority (Fahrerlaubnisbehörde)." }
            ],
            groups: [\`Drivers in \${city}\`, "Expat Car Owners"]
          }
        },
        {
          name: "Taxes & ID",
          desc: "Get your tax ID and understand local taxes.",
          details: {
            steps: [
              { title: "Receive Tax ID", desc: "Your Tax ID (Steuer-ID) is usually sent automatically via mail after your first address registration." },
              { title: "Choose Tax Class", desc: "Ensure your employer registers you in the correct tax class based on your marital status." },
              { title: "File Tax Return", desc: "Consider filing an annual tax return to claim expenses and get a refund." }
            ],
            groups: [\`Finance & Tax \${host}\`]
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
          details: {
            steps: [
              { title: "Choose a Bank", desc: "Decide between traditional branch banks or modern digital banks (e.g. N26, Revolut)." },
              { title: "Prepare ID", desc: "Have your passport and proof of address ready." },
              { title: "Verification", desc: "Complete the identity verification via video call or at a post office." }
            ],
            groups: [\`Finance & Tax \${host}\`]
          }
        },
        { 
          name: "Housing & Utilities", 
          desc: "Finding apartments and understanding contracts.",
          details: {
            steps: [
              { title: "Search Platforms", desc: "Use local property portals to find listings." },
              { title: "Prepare Application", desc: "Have your proof of income, credit score, and ID ready." },
              { title: "Set up Utilities", desc: "Once you sign a lease, register for electricity, water, and internet." }
            ],
            groups: [\`Housing \${city}\`, \`Flatmates \${city}\`]
          }
        },
        { 
          name: "Public Transport", 
          desc: "Navigating public transit and cycling.",
          details: {
            steps: [
              { title: "Understand Zones", desc: "Learn the tariff zones in \${city} to buy the correct tickets." },
              { title: "Buy a Pass", desc: "Consider a monthly subscription or a nationwide transit pass if available." },
              { title: "Cycling Rules", desc: "Familiarize yourself with local cycling regulations and dedicated paths." }
            ],
            groups: [\`Cycling \${city}\`, \`\${city} Commuters\`]
          }
        }
      ]
    },
    {
      label: "Health & Care",
      items: [
        { 
          name: "Health Insurance", 
          desc: "Choosing public or private health insurance.",
          details: {
            steps: [
              { title: "Public vs Private", desc: "Determine your eligibility for public insurance or if private fits you better." },
              { title: "Compare Providers", desc: "Research top public health funds (Krankenkassen)." },
              { title: "Enroll", desc: "Submit your application. Your employer might help with this process." }
            ],
            groups: [\`Health & Wellbeing \${city}\`]
          }
        },
        { 
          name: "Finding a Doctor", 
          desc: "How to find English-speaking doctors.",
          details: {
            steps: [
              { title: "Online Portals", desc: "Use platforms like Doctolib to find doctors by language." },
              { title: "Register as Patient", desc: "Call or visit the clinic to see if they are accepting new patients." },
              { title: "Emergency Clinics", desc: "Know the location of the nearest 24/7 medical on-call service." }
            ],
            groups: [\`Expat Parents \${city}\`, \`Health & Wellbeing \${city}\`]
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
        { t: "Book an appointment", d: "Find a slot at the local citizen's office.", done: false, tool: "Registration" },
        { t: "Prepare documents", d: "Gather passport, rental contract, and landlord confirmation.", done: false, tool: "Registration" },
        { t: "Attend appointment", d: "Go to the office and get your registration certificate.", done: false, tool: "Registration" }
      ]
    },
    {
      id: "g2",
      title: "Open a local bank account",
      cat: "Finance",
      steps: [
        { t: "Compare banks", d: "Look at traditional and digital banks.", done: false, tool: "Banking" },
        { t: "Prepare documents", d: "You usually need your passport and registration certificate.", done: false, tool: "Banking" },
        { t: "Verify identity", d: "Complete the online or in-person verification process.", done: false, tool: "Banking" }
      ]
    }
  ]
});`;

content = content.replace(/export const TEMPLATE_HOST_INFO = [\s\S]+?\}\);/m, replacement);
fs.writeFileSync(path, content, 'utf8');
