const fs = require('fs');
const path = 'src/constants.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `  goals: [
    {
      id: "g1",
      title: "Register your address (Anmeldung)",
      cat: "Documentation",
      steps: [
        { t: "Book an appointment", d: "Find a slot at the local citizen's office.", done: true, tool: "Registration" },
        { t: "Prepare documents", d: "Gather passport, rental contract, and landlord confirmation.", done: true, tool: "Registration" },
        { t: "Attend appointment", d: "Go to the office and get your registration certificate.", done: false, tool: "Registration" }
      ]
    },
    {
      id: "g2",
      title: "Open a local bank account",
      cat: "Finance",
      steps: [
        { t: "Compare banks", d: "Look at traditional and digital banks (N26, Revolut).", done: false, tool: "Banking" },
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
});`;

content = content.replace(/  goals: \[\s*\{[\s\S]+?\}\);\s*$/m, replacement);
fs.writeFileSync(path, content, 'utf8');
