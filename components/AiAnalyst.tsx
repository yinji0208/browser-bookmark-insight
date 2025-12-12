import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BookmarkStats } from '../types';
import { Brain, Sparkles, User, Lightbulb, Target, Loader2 } from 'lucide-react';

interface AiAnalystProps {
  stats: BookmarkStats;
}

const AiAnalyst: React.FC<AiAnalystProps> = ({ stats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompt = () => {
    const topDomainsStr = stats.topDomains.map(d => `${d.name} (${d.value} times)`).join(', ');
    const recentTitles = stats.mostRecent.map(r => r.title).join(', ');
    
    return `
      基于以下用户的 Chrome 书签数据，生成一份用户画像分析报告。
      请使用 Markdown 格式，语气专业且富有洞察力。
      
      数据概览:
      - 总书签数: ${stats.totalLinks}
      - 常用域名: ${topDomainsStr}
      - 最近收藏的内容标题: ${recentTitles}
      
      请分析以下几个方面:
      1. **兴趣领域**: 用户最关注的话题是什么？
      2. **职业推测**: 基于工具类或专业网站，推测用户的可能职业或技能树。
      3. **性格特征**: 例如是否喜欢囤积资料，或者关注特定类型的内容（如新闻、技术、娱乐）。
      4. **行动建议**: 给用户一条整理数字生活的建议。

      请保持回答简洁有力，重点突出。
    `;
  };

  const runAnalysis = async () => {
    if (!process.env.API_KEY) {
      setError("未检测到 API Key。请在代码构建时配置 process.env.API_KEY。由于这是演示应用，请确保环境安全。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = generatePrompt();
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: "You are an expert digital psychologist and data analyst.",
        }
      });

      setAnalysis(response.text || "无法生成分析结果。");
    } catch (err: any) {
      console.error(err);
      setError("AI 请求失败: " + (err.message || "未知错误"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-8 rounded-2xl text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-indigo-400/30">
            <Brain className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">AI 智能画像分析</h2>
          <p className="text-indigo-200/80 mb-8 max-w-lg mx-auto">
            让 Gemini 2.5 深度分析您的 {stats.totalLinks} 个书签，揭示您潜意识中的兴趣图谱与职业倾向。
          </p>
          
          {!analysis && !loading && (
            <button
              onClick={runAnalysis}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-all duration-300 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/40 hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5 text-indigo-600 group-hover:animate-pulse" />
              开始分析
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-indigo-300 animate-spin" />
              <span className="text-indigo-200 text-sm animate-pulse">正在解读您的数字足迹...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <User className="text-purple-400" />
            <h3 className="text-xl font-bold text-slate-100">分析报告</h3>
          </div>
          
          <div className="prose prose-invert prose-slate max-w-none">
             {/* Simple markdown rendering replacement since we can't import a markdown library easily in this constraints */}
             {analysis.split('\n').map((line, idx) => {
               if (line.startsWith('### ')) return <h3 key={idx} className="text-lg font-bold text-purple-300 mt-6 mb-3">{line.replace('### ', '')}</h3>;
               if (line.startsWith('## ')) return <h2 key={idx} className="text-xl font-bold text-blue-300 mt-8 mb-4">{line.replace('## ', '')}</h2>;
               if (line.startsWith('**') || line.includes('**')) {
                 // Simple bold parsing
                 const parts = line.split('**');
                 return (
                   <p key={idx} className="mb-2 text-slate-300 leading-relaxed">
                     {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-200">{part}</strong> : part)}
                   </p>
                 );
               }
               if (line.startsWith('- ')) return <li key={idx} className="ml-4 text-slate-300 mb-1 list-disc">{line.replace('- ', '')}</li>;
               if (line.trim() === '') return <br key={idx} />;
               return <p key={idx} className="mb-2 text-slate-300 leading-relaxed">{line}</p>;
             })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 flex flex-wrap gap-4">
             <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">
                <Lightbulb size={12} />
                Generated by Gemini 2.5 Flash
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full">
                <Target size={12} />
                Personalized Insight
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalyst;