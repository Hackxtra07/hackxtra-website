"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send, Radio, Signal, ShieldAlert, Cpu, Globe, Zap, Loader2 } from "lucide-react";

export default function AdminBroadcastPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sendEmail, setSendEmail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/chat/broadcast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    subject,
                    message,
                    sendEmailAlso: sendEmail
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast({
                    title: "Transmission Authorized",
                    description: `Successfully broadcasted to ${data.count} nodes in the network.`,
                });
                setSubject("");
                setMessage("");
                setSendEmail(false);
            } else {
                toast({
                    title: "Signal Failure",
                    description: "Authorization rejected by the network controller.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Critital Error",
                description: "Broadcast subsystem encountered an unhandled exception.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-4 text-white tracking-tighter">
                        <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/10 transition-transform group-hover:rotate-12 duration-500">
                            <Megaphone className="h-8 w-8" />
                        </div>
                        Broadcast Control
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium max-w-md">Dispatch high-priority transmissions and system-wide alerts to all active terminals.</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        UPLINK ACTIVE
                    </div>
                </div>
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden relative rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 group">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000">
                    <Signal size={250} className="text-indigo-500" />
                </div>

                <form onSubmit={handleBroadcast} className="relative z-10 space-y-10">
                    <div className="grid gap-10">
                        {/* Subject Input */}
                        <div className="grid gap-3 max-w-2xl">
                            <Label htmlFor="subject" className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1 flex items-center gap-2">
                                <Zap className="h-3 w-3 text-indigo-500" /> Transmission Header
                            </Label>
                            <div className="relative group/input">
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Critical System Harmonization v4.0"
                                    className="h-14 bg-black/40 border-white/10 focus:border-indigo-500/50 rounded-2xl text-white font-bold placeholder:text-gray-800 transition-all text-sm px-6"
                                    required
                                />
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent scale-x-0 group-focus-within/input:scale-x-100 transition-transform duration-500" />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="grid gap-3">
                            <Label htmlFor="message" className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600 ml-1 flex items-center gap-2">
                                <Radio className="h-3 w-3 text-indigo-500" /> Intel Payload (Markdown)
                            </Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Draft the manifestation narrative here. The grid supports full markdown synchronization for rich data delivery."
                                className="min-h-[300px] bg-black/40 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-gray-800 leading-relaxed font-medium resize-none p-8 rounded-3xl scrollbar-thin scrollbar-thumb-white/10"
                                required
                            />
                        </div>

                        {/* Options */}
                        <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-center justify-between ${sendEmail ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-black/20 border-white/5 opacity-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${sendEmail ? 'bg-indigo-500 text-black shadow-lg shadow-indigo-500/20' : 'bg-gray-500/10 text-gray-600'}`}>
                                    <Radio className="h-5 w-5" />
                                </div>
                                <div>
                                    <Label htmlFor="email-mode" className="font-black text-xs uppercase tracking-widest text-white cursor-pointer block">Multichannel Synchronization</Label>
                                    <p className="text-[10px] text-gray-500 font-bold mt-1">Authorize secondary SMTP relay for deep architecture penetration.</p>
                                </div>
                            </div>
                            <Switch
                                id="email-mode"
                                checked={sendEmail}
                                onCheckedChange={setSendEmail}
                                className="data-[state=checked]:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            type="submit"
                            className="h-16 px-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-[2rem] shadow-2xl shadow-indigo-500/30 border border-indigo-400/30 transition-all active:scale-95 disabled:grayscale"
                            disabled={isSubmitting || !message}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-4">
                                    <Loader2 className="h-5 w-5 animate-spin opacity-50" />
                                    Synchronizing Nodes...
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    Authorize Global Broadcast
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Metrics Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Transmission Scope", value: "Global Manifest", icon: Globe, color: "text-indigo-400" },
                    { label: "Relay Latency", value: "Real-time Sync", icon: Zap, color: "text-amber-400" },
                    { label: "Protocol Level", value: "Admin Authorized", icon: ShieldAlert, color: "text-rose-400" }
                ].map((item, i) => (
                    <div key={i} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:bg-white/[0.04] transition-all duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-600">{item.label}</span>
                            <item.icon className={`h-4 w-4 ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-10 opacity-20 py-10 grayscale pointer-events-none">
                <Radio size={40} />
                <Signal size={40} />
                <Cpu size={40} />
                <Globe size={40} />
            </div>
        </div>
    );
}
