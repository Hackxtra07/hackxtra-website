'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import {
  Activity, Users, BookOpen,
  Terminal, ShieldCheck, Cpu, Database,
  Globe, AlertTriangle, ArrowRight, Crown, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { request } = useApi();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    labs: 0,
    resources: 0,
    team: 0,
    channels: 0,
    documentaries: 0,
    news: 0,
    tools: 0,
    proUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [courses, labs, resources, team, channels, documentaries, newsRaw, toolsRaw, users] = await Promise.all([
          request('/api/courses').catch(() => []),
          request('/api/labs').catch(() => []),
          request('/api/resources').catch(() => []),
          request('/api/team').catch(() => []),
          request('/api/channels').catch(() => []),
          request('/api/documentaries').catch(() => []),
          request('/api/news').catch(() => ({ success: false, data: [] })),
          request('/api/tools').catch(() => ({ tools: [] })),
          request('/api/users').catch(() => [])
        ]);

        // Defensive check for each stat since APIs are inconsistent
        const getCount = (val: any) => Array.isArray(val) ? val.length : 0;

        const proCount = Array.isArray(users) ? users.filter((u: any) => u.isPro).length : 0;

        setStats({
          courses: getCount(courses?.courses || courses),
          labs: getCount(labs?.labs || labs),
          resources: getCount(resources?.resources || resources),
          team: getCount(team?.data || team),
          channels: getCount(channels?.data || channels),
          documentaries: getCount(documentaries),
          news: getCount(newsRaw?.data), // News returns { success: true, data: [...] }
          tools: getCount(toolsRaw?.tools), // Tools returns { tools: [...] }
          proUsers: proCount
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [request]);

  const statCards = [
    { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
    { label: 'Active Labs', value: stats.labs, icon: Terminal, color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/10' },
    { label: 'Pro Members', value: stats.proUsers, icon: Crown, color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' },
    { label: 'Security Tools', value: stats.tools, icon: ShieldCheck, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' },
    { label: 'News Articles', value: stats.news, icon: Globe, color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-400/10' },
    { label: 'Team Members', value: stats.team, icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white tracking-tighter">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
              <Activity className="h-8 w-8" />
            </div>
            Command Center
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Orchestrate platform metrics and monitor network vitality in real-time.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="px-5 py-2.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Defensive Grid Active
          </div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden transition-all duration-500 hover:border-${stat.color.split('-')[1]}-500/30`}
            >
              <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700 ${stat.color}`}>
                <Icon size={100} />
              </div>

              <div className="relative z-10">
                <div className={`p-3 w-fit rounded-2xl mb-6 bg-white/5 border border-white/10 ${stat.color} shadow-lg shadow-black/20`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <div className="text-4xl font-black text-white font-mono tracking-tighter">
                    {loading ? (
                      <div className="h-10 w-16 bg-white/10 rounded-lg animate-pulse" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  {!loading && i === 0 && <span className="text-xs text-green-500 font-bold mb-2">+12%</span>}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* System Status Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Cpu size={200} className="text-blue-500" />
          </div>

          <h2 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-widest">
            <div className="h-8 w-1.5 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            Infrastructure Vitality
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="grid">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Core Processor</span>
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-blue-500" /> Matrix Load</span>
                </div>
                <span className="text-blue-400 font-black font-mono text-lg">12%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "12%" }}
                  className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="grid">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Storage Cluster</span>
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2"><Database className="h-3.5 w-3.5 text-indigo-500" /> Archive Density</span>
                </div>
                <span className="text-indigo-400 font-black font-mono text-lg">45%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "45%" }}
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="grid">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Network Interface</span>
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-purple-500" /> Pulse Latency</span>
                </div>
                <span className="text-purple-400 font-black font-mono text-lg">24ms</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "8%" }}
                  className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="grid">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Engine</span>
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Threat Mitigation</span>
                </div>
                <span className="text-green-400 font-black font-mono text-lg">OFFLINE-G</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-full bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-black/40 rounded-3xl border border-white/5 group hover:bg-white/5 transition-colors duration-500">
              <div className="text-green-500 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center justify-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                Nominal
              </div>
              <div className="text-[10px] font-bold text-gray-600 uppercase">Primary Node</div>
            </div>
            <div className="text-center p-6 bg-black/40 rounded-3xl border border-white/5 group hover:bg-white/5 transition-colors duration-500">
              <div className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center justify-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin duration-[3000ms]" />
                Synchronized
              </div>
              <div className="text-[10px] font-bold text-gray-600 uppercase">Global Grid</div>
            </div>
            <div className="text-center p-6 bg-black/40 rounded-3xl border border-white/5 group hover:bg-white/5 transition-colors duration-500">
              <div className="text-indigo-400 font-mono font-black text-[11px] mb-1">X2.4.0</div>
              <div className="text-[10px] font-bold text-gray-600 uppercase">System Archetype</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md flex flex-col group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10">
            <div className="h-8 w-1.5 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            Threat Alerts
          </h2>

          <div className="space-y-4 flex-1 relative z-10">
            {[
              { msg: "Global Tools Grid Synchronized", time: "2m ago", type: "success" },
              { msg: "Unusual Traffic: Node #10294", time: "1h ago", type: "warning" },
              { msg: "Automated Data Backup Securing", time: "4h ago", type: "info" },
              { msg: "New Operative Registered", time: "12h ago", type: "success" },
            ].map((alert, i) => (
              <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-4 hover:bg-white/5 transition-colors duration-300">
                <div className={`mt-1.5 h-2 w-2 rounded-full shadow-lg ${alert.type === 'success' ? 'bg-green-500 shadow-green-500/40' :
                  alert.type === 'warning' ? 'bg-yellow-500 shadow-yellow-500/40' : 'bg-blue-500 shadow-blue-500/40'
                  }`} />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-200 leading-relaxed mb-1">{alert.msg}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all flex items-center justify-center gap-3 relative z-10 group/btn">
            Retrieve System Transcripts
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
