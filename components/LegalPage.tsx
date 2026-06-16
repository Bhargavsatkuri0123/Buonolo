import React from 'react';

const LegalPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Legal & Privacy</h1>
        <p className="text-slate-500 font-medium">Clear information about how we operate and protect your data.</p>
      </div>

      {/* Trust & Disclaimer Block */}
      <section className="bg-orange-50 border-2 border-orange-100 rounded-[2.5rem] p-8 md:p-12 space-y-6">
        <div className="flex items-center gap-4 text-orange-600">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest">Important Disclaimer</h2>
        </div>
        <div className="space-y-4 text-orange-900 leading-relaxed font-medium">
          <p>
            <strong>Buonolo is an independent resource</strong> and is NOT affiliated with the UK Home Office, 
            any European Union body, or any other national government agency or department.
          </p>
          <p>
            All information provided via our news feed, AI assistant, or visa pathways is for general information 
            purposes and guidance only. <strong>It does not constitute professional legal or immigration advice.</strong>
          </p>
          <p className="text-sm opacity-80">
            Immigration laws are subject to rapid change. We strongly recommend consulting with a certified immigration lawyer 
            or checking official government portals before making significant life decisions.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <i className="fa-solid fa-user-shield text-blue-600"></i> Privacy & GDPR
          </h3>
          <div className="text-sm text-slate-600 leading-relaxed space-y-4 font-medium">
            <p>
              We comply strictly with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the Data Protection Act 2018. 
            </p>
            <p>
              Your personal data (such as saved countries or locations) is encrypted and never sold to third parties. 
              We use this data solely to personalize your experience and provide relevant local news.
            </p>
            <ul className="space-y-2 list-none">
              <li className="flex gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i> Data Encryption at rest and in transit</li>
              <li className="flex gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i> Right to be forgotten (delete account)</li>
              <li className="flex gap-2"><i className="fa-solid fa-check text-green-500 mt-1"></i> Transparent usage logs</li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <i className="fa-solid fa-envelope text-blue-600"></i> Contact Us
          </h3>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Company</p>
              <a href="https://pearwavetechnologiesltd.com" target="_blank" className="text-sm font-black text-blue-600 hover:underline">PWT ltd</a>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Location</p>
              <p className="text-sm font-bold text-slate-900">Warwick, United Kingdom</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Registration</p>
              <p className="text-xs font-medium text-slate-500">Buonolo is a product of PWT ltd.<br/>Registered in the United Kingdom.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Terms of Service</h3>
        <div className="text-sm text-slate-600 leading-relaxed space-y-4 font-medium">
          <p>
            By using Buonolo, you agree to our terms of service. Our platform utilizes advanced Large Language Models (LLMs) to 
            synthesize news and provide assistance. While we strive for accuracy, AI-generated content may occasionally contain 
            inaccuracies or outdated information.
          </p>
          <p>
            You agree to use Buonolo only for lawful purposes and to respect the community guidelines in our Network Hub. 
            We reserve the right to suspend accounts that engage in harassment or distribute misinformation.
          </p>
        </div>
      </section>

      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Version 1.0.0 Beta • Updated Jan 2026
        </p>
      </div>
    </div>
  );
};

export default LegalPage;