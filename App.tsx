import React, { useState } from 'react';
import { BookmarkNode, BookmarkStats, AppView } from './types';
import FileUpload from './components/FileUpload';
import StatsDashboard from './components/StatsDashboard';
import AiAnalyst from './components/AiAnalyst';
import { LayoutDashboard, Brain, FolderOpen, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode | null>(null);
  const [stats, setStats] = useState<BookmarkStats | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);

  const handleDataLoaded = (root: BookmarkNode, newStats: BookmarkStats) => {
    setBookmarks(root);
    setStats(newStats);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleReset = () => {
    setBookmarks(null);
    setStats(null);
    setCurrentView(AppView.UPLOAD);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
        ${currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              B
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-100">
              Bookmark <span className="text-blue-400">Insight</span>
            </span>
          </div>

          {stats && (
            <nav className="hidden md:flex items-center gap-2">
              <NavButton view={AppView.DASHBOARD} icon={LayoutDashboard} label="概览" />
              <NavButton view={AppView.AI_INSIGHTS} icon={Brain} label="AI 分析" />
              {/* Explorer Placeholder - simplified for this demo */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 cursor-not-allowed opacity-50">
                 <FolderOpen size={18} />
                 <span>文件浏览 (Dev)</span>
              </button>
            </nav>
          )}

          {stats && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm px-3 py-1.5 rounded-md hover:bg-slate-800"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">重新上传</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!stats || currentView === AppView.UPLOAD ? (
          <FileUpload onDataLoaded={handleDataLoaded} />
        ) : (
          <>
            {currentView === AppView.DASHBOARD && <StatsDashboard stats={stats} />}
            {currentView === AppView.AI_INSIGHTS && <AiAnalyst stats={stats} />}
          </>
        )}
      </main>

      {/* Mobile Nav (Bottom) */}
      {stats && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-50">
           <button 
             onClick={() => setCurrentView(AppView.DASHBOARD)}
             className={`flex flex-col items-center gap-1 ${currentView === AppView.DASHBOARD ? 'text-blue-400' : 'text-slate-500'}`}
           >
             <LayoutDashboard size={20} />
             <span className="text-xs">概览</span>
           </button>
           <button 
             onClick={() => setCurrentView(AppView.AI_INSIGHTS)}
             className={`flex flex-col items-center gap-1 ${currentView === AppView.AI_INSIGHTS ? 'text-purple-400' : 'text-slate-500'}`}
           >
             <Brain size={20} />
             <span className="text-xs">AI</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;