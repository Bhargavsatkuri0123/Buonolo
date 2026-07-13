const fs = require('fs');
let code = fs.readFileSync('src/constants.ts', 'utf8');

// Update TEMPLATE_HOST_INFO steps with links for toolSections
code = code.replace(
  '{ title: "Book an Appointment", desc: "Visit the local citizen\'s office website and book an appointment online. Do this early as slots fill up quickly." }',
  '{ title: "Book an Appointment", desc: "Visit the local citizen\'s office website and book an appointment online. Do this early as slots fill up quickly.", links: [{ label: "Official Portal (Web)", url: "https://google.com/search?q=citizen+office+appointment+" + encodeURIComponent(city), type: "web" }, { label: "Guide to Registration (Video)", url: "https://www.youtube.com/results?search_query=how+to+register+address+" + encodeURIComponent(city), type: "video" }] }'
);

code = code.replace(
  '{ title: "Identify Visa Type", desc: "Determine whether you need a Blue Card, Work Visa, or Student Visa based on your purpose." }',
  '{ title: "Identify Visa Type", desc: "Determine whether you need a Blue Card, Work Visa, or Student Visa based on your purpose.", links: [{ label: "Gov Visa Portal (Web)", url: "https://google.com/search?q=visa+types+" + encodeURIComponent(host), type: "web" }, { label: "Visa Types Explained (Video)", url: "https://www.youtube.com/results?search_query=visa+types+" + encodeURIComponent(host), type: "video" }] }'
);

code = code.replace(
  '{ title: "Check Reciprocity", desc: "Verify if your home country\'s license can be converted without a test." }',
  '{ title: "Check Reciprocity", desc: "Verify if your home country\'s license can be converted without a test.", links: [{ label: "Driving License Rules (Doc)", url: "https://google.com/search?q=driving+license+conversion+" + encodeURIComponent(origin) + "+to+" + encodeURIComponent(host), type: "doc" }] }'
);

code = code.replace(
  '{ title: "Choose a Bank", desc: "Decide between traditional branch banks or modern digital banks (e.g. N26, Revolut)." }',
  '{ title: "Choose a Bank", desc: "Decide between traditional branch banks or modern digital banks (e.g. N26, Revolut).", links: [{ label: "Best Banks for Expats (Video)", url: "https://www.youtube.com/results?search_query=best+banks+for+expats+" + encodeURIComponent(host), type: "video" }] }'
);

// Update goals in TEMPLATE_HOST_INFO
code = code.replace(
  '{ t: "Book an appointment", d: "Find a slot at the local citizen\'s office.", done: true, tool: "Registration" }',
  '{ t: "Book an appointment", d: "Find a slot at the local citizen\'s office.", done: true, tool: "Registration", links: [{ label: "Registration Guide (Video)", url: "https://www.youtube.com/results?search_query=how+to+register+address+" + encodeURIComponent(city), type: "video" }] }'
);

code = code.replace(
  '{ t: "Compare banks", d: "Look at traditional and digital banks (N26, Revolut).", done: false, tool: "Banking" }',
  '{ t: "Compare banks", d: "Look at traditional and digital banks (N26, Revolut).", done: false, tool: "Banking", links: [{ label: "Top Banks (Video)", url: "https://www.youtube.com/results?search_query=best+banks+" + encodeURIComponent(host), type: "video" }, { label: "Banking Guide (Web)", url: "https://google.com/search?q=open+bank+account+" + encodeURIComponent(host), type: "web" }] }'
);

fs.writeFileSync('src/constants.ts', code);
