import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';

const App: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('sim-create');

  const toggle = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf5] font-sans text-[#3e2f1c] p-4 md:p-12 dir-rtl" dir="rtl">
      
      {/* Header - Clean & Professional */}
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-[#4a3728] mb-4 tracking-tight">מרכז ההדרכה הקהילתי</h1>
        <p className="text-[#8b7355] text-lg max-w-2xl mx-auto leading-relaxed">
          מדריכים אינטראקטיביים לשימוש נכון ומתקדם במערכת הפורומים. 
          <br/>עקבו אחרי העכבר כדי ללמוד את הפעולות הבסיסיות.
        </p>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* --- Simulator 1: New Topic --- */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e6ccb2] overflow-hidden">
          <button 
            onClick={() => toggle('sim-create')}
            className={`w-full flex items-center justify-between p-6 text-right transition-colors ${openItem === 'sim-create' ? 'bg-[#fffdf5]' : 'hover:bg-[#fff9e6]'}`}
          >
            <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-[#27ae60]"></span>
                <span className="font-bold text-xl text-[#4a3728]">איך פותחים נושא חדש ומעוצב?</span>
            </div>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform duration-500 ${openItem === 'sim-create' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-create' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-[#fffdf5] border-t border-[#f0e6d2]">
               {openItem === 'sim-create' && <ForumSimulator mode="create" />}
            </div>
          </div>
        </div>

        {/* --- Simulator 2: Reply --- */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e6ccb2] overflow-hidden">
          <button 
            onClick={() => toggle('sim-reply')}
            className={`w-full flex items-center justify-between p-6 text-right transition-colors ${openItem === 'sim-reply' ? 'bg-[#fffdf5]' : 'hover:bg-[#fff9e6]'}`}
          >
             <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-[#2980b9]"></span>
                <span className="font-bold text-xl text-[#4a3728]">איך מגיבים ומוסיפים תמונות?</span>
            </div>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform duration-500 ${openItem === 'sim-reply' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-reply' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-[#fffdf5] border-t border-[#f0e6d2]">
               {openItem === 'sim-reply' && <ForumSimulator mode="reply" />}
            </div>
          </div>
        </div>

        {/* --- Simulator 3: Follow Topic --- */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e6ccb2] overflow-hidden">
          <button 
            onClick={() => toggle('sim-follow')}
            className={`w-full flex items-center justify-between p-6 text-right transition-colors ${openItem === 'sim-follow' ? 'bg-[#fffdf5]' : 'hover:bg-[#fff9e6]'}`}
          >
             <div className="flex items-center gap-4">
                <span className="w-2 h-2 rounded-full bg-[#f39c12]"></span>
                <span className="font-bold text-xl text-[#4a3728]">איך עוקבים אחרי נושא לקבלת התראות?</span>
            </div>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform duration-500 ${openItem === 'sim-follow' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-follow' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-[#fffdf5] border-t border-[#f0e6d2]">
               {openItem === 'sim-follow' && <ForumSimulator mode="follow" />}
            </div>
          </div>
        </div>

      </div>
      
      <footer className="text-center mt-20 text-[#b0a99f] text-sm">
        <p>מבוסס על מערכת NodeBB &copy; 2024</p>
      </footer>
    </div>
  );
};

export default App;