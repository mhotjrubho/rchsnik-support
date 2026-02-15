import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';

const App: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('sim-create');

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] p-4 md:p-12" dir="rtl">
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <h1 className="text-4xl font-black text-[#1a1a1a] mb-3">מדריכי קהילת רכוסניק</h1>
        <p className="text-[#6c757d] text-lg font-medium">למדו איך להשתמש בפורום בצורה מקצועית ויעילה</p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Guide 1: New Topic */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-create' ? null : 'sim-create')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-create' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-bold text-xl">פתיחת נושא חדש ושימוש בכלי עריכה</span>
            <svg className={`w-6 h-6 transition-transform ${openItem === 'sim-create' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {openItem === 'sim-create' && <div className="p-4 bg-white"><ForumSimulator mode="create" /></div>}
        </section>

        {/* Guide 2: Reply */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-reply' ? null : 'sim-reply')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-reply' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-bold text-xl">איך להגיב להודעה ולהוסיף תמונה</span>
            <svg className={`w-6 h-6 transition-transform ${openItem === 'sim-reply' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {openItem === 'sim-reply' && <div className="p-4 bg-white"><ForumSimulator mode="reply" /></div>}
        </section>

        {/* Guide 3: Follow */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-follow' ? null : 'sim-follow')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-follow' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-bold text-xl">הגדרת מעקב אחרי שרשור (קבלת התראות)</span>
            <svg className={`w-6 h-6 transition-transform ${openItem === 'sim-follow' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {openItem === 'sim-follow' && <div className="p-4 bg-white"><ForumSimulator mode="follow" /></div>}
        </section>
      </div>
    </div>
  );
};

export default App;