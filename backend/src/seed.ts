import { prisma } from "./db.js";

const GOAL_TEMPLATES = [
  { title: "Register your address (Anmeldung)", category: "Documentation", iconName: "FileText", weeks: "1–3 weeks", steps: [{ t: "Book an appointment", d: "Find a slot at the local citizen's office.", tool: "Registration" }, { t: "Prepare documents", d: "Gather passport, rental contract, and landlord confirmation.", tool: "Registration" }, { t: "Attend appointment", d: "Go to the office and get your registration certificate.", tool: "Registration" }] },
  { title: "Find long-term housing", category: "Housing", iconName: "KeyRound", weeks: "4–12 weeks", steps: [{ t: "Search rental platforms", d: "Set alerts and reply quickly to new listings.", tool: "Housing & Utilities" }, { t: "Prepare an application folder", d: "Passport copy, salary slips, credit score check.", tool: "Housing & Utilities" }, { t: "Sign the lease", d: "Check the minimum rental period and deposit rules.", tool: "Housing & Utilities" }] },
  { title: "Open a local bank account", category: "Finance", iconName: "CreditCard", weeks: "1 week", steps: [{ t: "Compare banks", d: "Look at traditional and digital banks (N26, Revolut).", tool: "Banking" }, { t: "Prepare documents", d: "You usually need your passport and registration certificate.", tool: "Banking" }, { t: "Verify identity", d: "Complete the online or in-person verification process.", tool: "Banking" }] },
  { title: "Reach A2 in the local language", category: "Language", iconName: "Languages", weeks: "3–6 months", steps: [{ t: "Take a placement test", d: "Find your current level before picking a course.", tool: "" }, { t: "Enroll in a course", d: "Group classes, online courses, or a tutor.", tool: "" }, { t: "Practice with locals", d: "Join a language exchange meetup.", tool: "Language Exchange" }] },
  { title: "Convert your driving license", category: "Mobility", iconName: "Car", weeks: "4–8 weeks", steps: [{ t: "Check reciprocity rules", d: "See if your country has a license conversion agreement.", tool: "Public Transport" }, { t: "Gather documents", d: "Passport, current license, translation if required.", tool: "" }, { t: "Book the exchange appointment", d: "Submit your application at the licensing authority.", tool: "" }] },
  { title: "Find your first local job", category: "Career", iconName: "Briefcase", weeks: "2–6 months", steps: [{ t: "Update your CV/resume", d: "Adapt the format to local conventions.", tool: "" }, { t: "Build your network", d: "Attend meetups in your professional field.", tool: "Professional Network" }, { t: "Apply and interview", d: "Track applications and prepare for local interview norms.", tool: "" }] },
  { title: "Set up health insurance & a doctor", category: "Health", iconName: "Stethoscope", weeks: "1–2 weeks", steps: [{ t: "Public vs private", d: "Understand your eligibility and pick the best system.", tool: "Health Insurance" }, { t: "Compare providers", d: "Research the major health funds.", tool: "Health Insurance" }, { t: "Find a doctor", d: "Book with an English-speaking GP near you.", tool: "Finding a Doctor" }] },
  { title: "Build a local support circle", category: "Community", iconName: "Users", weeks: "ongoing", steps: [{ t: "Join a community group", d: "Find an expat or interest-based group nearby.", tool: "Community Centers" }, { t: "Attend an event", d: "Go to a meetup, workshop, or social event.", tool: "" }, { t: "Stay consistent", d: "Keep showing up — community takes repetition.", tool: "" }] },
  { title: "Get a local SIM card", category: "Daily Life", iconName: "Smartphone", weeks: "1 day", steps: [{ t: "Prepaid or contract", d: "Decide whether you need a flexible prepaid plan or a long-term contract.", tool: "" }, { t: "Buy a SIM", d: "Purchase from a supermarket or a telecom store.", tool: "" }, { t: "Activate online", d: "Use the video verification process to activate.", tool: "" }] },
];

async function main() {
  for (const template of GOAL_TEMPLATES) {
    const existing = await prisma.goalTemplate.findFirst({ where: { title: template.title } });
    if (existing) {
      await prisma.goalTemplate.update({ where: { id: existing.id }, data: template });
    } else {
      await prisma.goalTemplate.create({ data: template });
    }
  }
  console.log(`Seeded ${GOAL_TEMPLATES.length} goal templates.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
