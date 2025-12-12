import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { parseBookmarks } from '../utils/parser';
import { BookmarkNode, BookmarkStats } from '../types';

interface FileUploadProps {
  onDataLoaded: (root: BookmarkNode, stats: BookmarkStats) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = (file: File) => {
    if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
      setError('请上传 Chrome 书签导出的 HTML 文件');
      return;
    }

    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { root, stats } = parseBookmarks(content);
        if (stats.totalLinks === 0 && stats.totalFolders === 0) {
          setError('未检测到有效的书签数据。请确保文件格式正确。');
          setIsLoading(false);
          return;
        }
        // Artificial delay for smooth UX
        setTimeout(() => {
          onDataLoaded(root, stats);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setError('解析文件时出错');
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Bookmark Insight AI
        </h1>
        <p className="text-slate-400 text-lg">
          上传 Chrome 书签文件，通过 AI 解锁你的浏览习惯分析
        </p>
      </div>

      <div
        className={`
          relative w-full max-w-2xl border-2 border-dashed rounded-2xl p-12 transition-all duration-300
          flex flex-col items-center justify-center cursor-pointer group
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-102' 
            : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/50 bg-slate-800/30'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept=".html"
          onChange={handleFileInput}
        />

        <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          ) : (
            <Upload className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-slate-400'}`} />
          )}
        </div>

        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {isLoading ? '正在分析数据...' : '点击或拖拽上传 HTML 文件'}
        </h3>
        <p className="text-slate-500 text-sm max-w-sm text-center">
          支持 Chrome, Edge, Firefox 等浏览器导出的 HTML 书签格式文件
        </p>

        {error && (
          <div className="absolute -bottom-16 left-0 right-0 mx-auto w-fit flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-slate-400">
         <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <FileText className="mb-3 text-emerald-400" />
            <span className="font-medium text-slate-200">本地解析</span>
            <span className="text-xs mt-1 text-center">所有数据在浏览器端处理，不会上传至服务器</span>
         </div>
         <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="mb-3 font-bold text-xl text-blue-400">AI</div>
            <span className="font-medium text-slate-200">Gemini 驱动</span>
            <span className="text-xs mt-1 text-center">使用 Gemini 2.5 分析你的兴趣画像与职业倾向</span>
         </div>
         <div className="flex flex-col items-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="w-6 h-6 mb-3 rounded border-2 border-purple-400 flex items-center justify-center text-[10px] text-purple-400 font-bold">VS</div>
            <span className="font-medium text-slate-200">可视化图表</span>
            <span className="text-xs mt-1 text-center">直观展示常用域名、收藏时间分布等维度</span>
         </div>
      </div>
    </div>
  );
};

export default FileUpload;