import React from 'react';

const DUMMY_TASKS = [
  { id: 1, title: 'Register at local municipality', due: 'Tomorrow', completed: false },
  { id: 2, title: 'Open a bank account', due: 'Next week', completed: false },
  { id: 3, title: 'Get a local sim card', due: 'Done', completed: true }
];

const TasksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in flex flex-col text-center">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-orange-50 text-primary rounded-[2.5rem] flex items-center justify-center text-5xl mb-4 shadow-sm border border-orange-100">
          <i className="fa-solid fa-check-double"></i>
        </div>
        <h2 className="text-4xl font-black text-slate-800">Tasks to do</h2>
        <p className="text-lg text-slate-500 font-medium">Your current pending actions.</p>
      </div>

      <div className="space-y-4 text-left w-full max-w-2xl mx-auto">
        {DUMMY_TASKS.map((task) => (
          <div key={task.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm flex justify-between items-center ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <button className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                {task.completed && <i className="fa-solid fa-check text-xs"></i>}
              </button>
              <div>
                <h3 className={`font-black text-slate-800 ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                <p className="text-sm font-bold text-slate-400">{task.due}</p>
              </div>
            </div>
            <button className="text-slate-300 hover:text-red-500 transition-colors">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
