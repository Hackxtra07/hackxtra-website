'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import {
  Activity, Users, BookOpen,
  Terminal, ShieldCheck, Cpu, Database,
  Globe, AlertTriangle, ArrowRight, Crown
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
          courses: getCount(courses),
          labs: getCount(labs),
          resources: getCount(resources),
          team: getCount(team),
          channels: getCount(channels),
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
    <div className="space-y-8">
      {/* Header Stats */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">System Overview</h1>
        <p className="text-gray-400 mb-6">Real-time metrics and platform statistics.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                  <Icon size={80} />
                </div>

                <div className="relative z-10">
                  <div className={`p-2 w-fit rounded-lg mb-4 ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1 font-mono">
                    {loading ? "..." : stat.value}
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Status Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            System Health
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2"><Cpu size={14} /> Server Load</span>
                <span className="text-green-400 font-mono">12%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[12%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2"><Database size={14} /> Database Usage</span>
                <span className="text-blue-400 font-mono">45%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[45%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2"><Globe size={14} /> API Latency</span>
                <span className="text-purple-400 font-mono">24ms</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[8%]" />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-green-500 font-bold mb-1">Operational</div>
              <div className="text-xs text-gray-500">API Status</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-green-500 font-bold mb-1">Synced</div>
              <div className="text-xs text-gray-500">Node Sync</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/5">
              <div className="text-blue-500 font-bold mb-1">v2.4.0</div>
              <div className="text-xs text-gray-500">Version</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md flex flex-col"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Recent Alerts
          </h2>

          <div className="space-y-4 flex-1">
            {[
              { msg: "New Kali Tools Synced", time: "2m ago", type: "success" },
              { msg: "High Traffic from IP 192.168.x", time: "1h ago", type: "warning" },
              { msg: "Database Backup Completed", time: "4h ago", type: "info" },
            ].map((alert, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${alert.type === 'success' ? 'bg-green-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                <div>
                  <div className="text-sm text-gray-200">{alert.msg}</div>
                  <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2">
            View System Logs <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
