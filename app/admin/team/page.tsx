'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Plus, Search, Mail, Shield, UserPlus,
  MoreHorizontal, Edit2, Trash2, Loader2, Target,
  Activity, Globe, Zap, Fingerprint, ShieldAlert,
  ChevronRight, Database, Network, Cpu, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Member {
  _id: string;
  name: string;
  role: string;
  email: string;
  image?: string;
  status?: 'active' | 'inactive';
}

export default function AdminTeamPage() {
  const { request, loading } = useApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await request("/api/team");
      setMembers(data || []);
    } catch (error) {
      toast.error("Failed to fetch operative records");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this operative?")) return;
    try {
      await request(`/api/team?id=${id}`, { method: "DELETE" });
      toast.success("Operative decommissioned");
      setMembers(members.filter(m => m._id !== id));
    } catch (error) {
      toast.error("Decommission protocol failed");
    }
  };

  const filteredMembers = (members || []).filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 pointer-events-none" />
        <div className="relative z-10 text-left">
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter uppercase">
            <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110 duration-500">
              <Fingerprint className="h-8 w-8" />
            </div>
            High-Value Operatives
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Manage security clearances, operative designations, and network access protocols.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
          <div className="relative group/search flex-1 sm:w-64 text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-hover/search:text-blue-400 transition-colors" />
            <Input
              placeholder="Identify Operative..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-black/40 border-white/10 h-14 text-white placeholder:text-zinc-700 rounded-2xl focus:border-blue-500/50 transition-all font-mono text-xs"
            />
          </div>
          <Button
            className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-blue-500/20 border border-blue-400/30 rounded-2xl transition-all"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Deploy Operative
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-10">
        <div className="flex justify-start">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 h-14 rounded-2xl flex w-80">
            <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all gap-3">
              <Activity size={14} /> Active
            </TabsTrigger>
            <TabsTrigger value="reserve" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all gap-3">
              <Clock size={14} /> Reserve
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {filteredMembers.map((member) => (
              <Card key={member._id} className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/40 transition-all duration-500 relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shield size={120} />
                </div>

                <CardHeader className="p-8 pb-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-full w-full object-cover rounded-xl shadow-2xl" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-black/40 rounded-xl">
                          <Users className="text-blue-500 h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl">
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(member._id)}
                        className="h-10 w-10 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-8 space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors leading-none">{member.name}</h3>
                    <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.3em] font-mono">{member.role}</p>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-4 space-y-8 relative z-10">
                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 group/link hover:border-blue-500/20 transition-all cursor-pointer">
                      <Mail className="h-4 w-4 text-zinc-600 group-hover/link:text-blue-400 transition-colors" />
                      <span className="text-xs text-zinc-400 font-mono group-hover/link:text-zinc-200 transition-colors truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 group/link hover:border-emerald-500/20 transition-all cursor-pointer">
                      <ShieldAlert className="h-4 w-4 text-zinc-600 group-hover/link:text-emerald-400 transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Classification L-7</span>
                      <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 p-4 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-1 items-center justify-center">
                      <span className="text-lg font-black text-white font-mono leading-none">84</span>
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">SESSIONS</span>
                    </div>
                    <div className="flex-1 p-4 rounded-[1.5rem] bg-blue-500/5 border border-blue-500/10 flex flex-col gap-1 items-center justify-center">
                      <span className="text-lg font-black text-white font-mono leading-none">12.4k</span>
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">IMPACT</span>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </Card>
            ))}

            {filteredMembers.length === 0 && (
              <div className="col-span-full py-40 flex flex-col items-center justify-center gap-8 opacity-20">
                <Database size={64} className="text-zinc-700" />
                <div className="text-center space-y-2">
                  <p className="text-xl font-black uppercase tracking-[0.4em] text-zinc-500 italic">No operative records found.</p>
                  <p className="text-[10px] font-mono text-zinc-800 tracking-widest uppercase">Check your security clearance or filter parameters.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center flex-col items-center gap-4 opacity-40 mt-10">
        <Globe size={24} className="text-zinc-700" />
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-800 text-center italic">"Loyalty is the core protocol. Excellence is the only output."</p>
      </div>
    </div>
  );
}
