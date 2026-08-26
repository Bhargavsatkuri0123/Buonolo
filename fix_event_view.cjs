const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityTab.tsx', 'utf8');

const target = `              <div>
                <p className={\`text-sm font-bold \${T.text}\`}>{selectedEvent.attendees} attendees</p>
                <p className={\`text-xs \${T.sub}\`}>+15 spots left</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className={\`flex-1 py-3.5 rounded-xl bg-orange-500 text-white font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30\`}>
            <CheckCircle2 size={18} /> RSVP Going
          </button>
          <button className={\`px-6 py-3.5 rounded-xl \${T.card} \${T.text} font-bold text-center border border-orange-200 dark:border-zinc-800\`}>
            Maybe
          </button>
        </div>
        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>About this event</p>
          <p className={\`text-sm \${T.text} leading-relaxed\`}>
            Join us for a wonderful time! This is a great opportunity to meet new people and share experiences. Don't forget to bring your enthusiasm and good vibes. Look out for the group with the orange balloon.
          </p>
        </div>
        <div> 
          <div className="flex items-center justify-between mb-3">
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Attendees</p>
            <button className="text-xs font-semibold text-orange-600">See all {selectedEvent.attendees}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {DUMMY_PEOPLE.map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick(p)}>
                  <Avatar name={p.name} />
                </div>
              ))}
            </div>
            <div className={\`w-10 h-10 rounded-full border-2 border-white dark:border-black \${T.card2} flex items-center justify-center text-[10px] font-bold \${T.text} -ml-3 relative\`} style={{ zIndex: 0 }}>
              +{selectedEvent.attendees - 3}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;

const replacement = `              <div>
                <p className={\`text-sm font-bold \${T.text}\`}>{attendees} attendees</p>
                <p className={\`text-xs \${T.sub}\`}>+15 spots left</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            disabled={isRsvping}
            onClick={handleRSVP}
            className={\`flex-1 py-3.5 rounded-xl \${joined ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'} font-bold text-center flex items-center justify-center gap-2 transition-all\`}
          >
            {joined ? <><CheckCircle2 size={18} /> Cancel RSVP</> : <><CheckCircle2 size={18} /> RSVP Going</>}
          </button>
        </div>
        <div>
          <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub} mb-3\`}>About this event</p>
          <p className={\`text-sm \${T.text} leading-relaxed whitespace-pre-wrap\`}>
            {selectedEvent.description || "Join us for a wonderful time! This is a great opportunity to meet new people and share experiences."}
          </p>
        </div>
        <div> 
          <div className="flex items-center justify-between mb-3">
            <p className={\`text-xs font-bold uppercase tracking-wider \${T.sub}\`}>Attendees</p>
            <button className="text-xs font-semibold text-orange-600">See all {attendees}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {DUMMY_PEOPLE.slice(0, Math.min(3, Math.max(0, attendees))).map((p, i) => (
                <div key={p.id} className="w-10 h-10 rounded-full border-2 border-white dark:border-black overflow-hidden relative z-10" style={{ zIndex: 10 - i }} onClick={() => onUserClick(p)}>
                  <Avatar name={p.name} />
                </div>
              ))}
            </div>
            {attendees > 3 && (
              <div className={\`w-10 h-10 rounded-full border-2 border-white dark:border-black \${T.card2} flex items-center justify-center text-[10px] font-bold \${T.text} -ml-3 relative\`} style={{ zIndex: 0 }}>
                +{attendees - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};`;

if (!code.includes(target)) {
  console.log("Target not found!");
} else {
  fs.writeFileSync('src/components/CommunityTab.tsx', code.replace(target, replacement));
  console.log("Replaced successfully!");
}
