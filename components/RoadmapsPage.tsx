import React from 'react';

const DUMMY_ROADMAPS = [
  { id: 1, title: 'Obtaining Residency', status: 'In Progress', progress: 45 },
  { id: 2, title: 'Finding Housing', status: 'Not Started', progress: 0 },
  { id: 3, title: 'Setting up Healthcare', status: 'Completed', progress: 100 }
];

const RoadmapsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in flex flex-col text-center">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-orange-50 text-primary rounded-[2.5rem] flex items-center justify-center text-5xl mb-4 shadow-sm border border-orange-100">
          <i className="fa-solid fa-map"></i>
        </div>
        <h2 className="text-4xl font-black text-slate-800">Goal Roadmaps</h2>
        <p className="text-lg text-slate-500 font-medium">Track your settlement progress.</p>
      </div>

      <div className="space-y-4 text-left w-full max-w-2xl mx-auto">
        {DUMMY_ROADMAPS.map((roadmap) => (
          <div key={roadmap.id} className="bg-white p-6 rounded-[2rem] border shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-lg">{roadmap.title}</h3>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${roadmap.status === 'Completed' ? 'bg-green-100 text-green-700' : roadmap.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                {roadmap.status}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${roadmap.status === 'Completed' ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${roadmap.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapsPage;
