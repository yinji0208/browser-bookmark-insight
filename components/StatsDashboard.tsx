import React from 'react';
import { BookmarkStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Folder, Link as LinkIcon, Calendar, TrendingUp } from 'lucide-react';

interface StatsDashboardProps {
  stats: BookmarkStats;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a8a29e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-medium mb-1">{label}</p>
        <p className="text-blue-400 text-sm">
          数量: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      <div className={color}>{icon}</div>
    </div>
  </div>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="总书签数" 
          value={stats.totalLinks} 
          icon={<LinkIcon size={24} />} 
          color="text-blue-400" 
        />
        <StatCard 
          title="文件夹数" 
          value={stats.totalFolders} 
          icon={<Folder size={24} />} 
          color="text-emerald-400" 
        />
        <StatCard 
          title="最早收藏年份" 
          value={stats.bookmarksByYear[0]?.name || 'N/A'} 
          icon={<Calendar size={24} />} 
          color="text-purple-400" 
        />
        <StatCard 
          title="最常访问" 
          value={stats.topDomains[0]?.name || 'N/A'} 
          icon={<TrendingUp size={24} />} 
          color="text-orange-400" 
        />
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Domains Bar Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            Top 10 常用域名
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats.topDomains}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#334155', opacity: 0.4}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.topDomains.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline Area Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
            收藏趋势时间轴
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.bookmarksByYear}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;