"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
    Send, Search, User, Radio, Loader2, Signal,
    ShieldCheck, MessageSquare, Zap, Globe, Cpu,
    Terminal, Activity, Fingerprint
} from "lucide-react";
import { format } from "date-fns";

interface ChatUser {
    user: {
        _id: string;
        username: string;
        email: string;
        avatarColor: string;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
    };
    unreadCount: number;
}

interface Message {
    _id: string;
    sender: string;
    senderModel: 'User' | 'Admin';
    content: string;
    createdAt: string;
    isSaved: boolean;
}

export default function AdminChatPage() {
    const [conversations, setConversations] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/chat?partnerId=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSaveMessage = async (messageId: string, currentSaved: boolean) => {
        try {
            const res = await fetch('/api/chat', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ messageId, isSaved: !currentSaved })
            });

            if (res.ok) {
                setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isSaved: !currentSaved } : m));
                toast({ title: !currentSaved ? "Message Saved" : "Message Unsaved" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({
                    content: newMessage,
                    recipientId: selectedUser
                })
            });

            if (res.ok) {
                const msg = await res.json();
                setMessages([...messages, msg]);
                setNewMessage("");
                // Update conversation list last message preview
                setConversations(prev => prev.map(c =>
                    c.user._id === selectedUser
                        ? { ...c, lastMessage: { content: msg.content, createdAt: msg.createdAt } }
                        : c
                ));
            } else {
                toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    const selectedUserData = conversations.find(c => c.user._id === selectedUser)?.user;

    const [showListOnMobile, setShowListOnMobile] = useState(true);

    useEffect(() => {
        if (selectedUser) {
            setShowListOnMobile(false);
        }
    }, [selectedUser]);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 p-4 md:p-0 overflow-hidden max-w-7xl mx-auto">
            {/* Sidebar List */}
            <Card className={`w-full md:w-[380px] flex flex-col border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-500 rounded-[2.5rem] shadow-2xl relative group ${!showListOnMobile ? 'hidden md:flex' : 'flex'}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                <div className="p-8 border-b border-white/10 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-black text-xs uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                            <Radio className="w-4 h-4 text-blue-500" /> Secure Nodes
                        </h2>
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                    <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within/search:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Scan frequencies..."
                            className="pl-11 bg-black/40 border-white/10 text-white text-[10px] font-black uppercase tracking-widest h-12 rounded-2xl focus:border-blue-500/50 transition-all placeholder:text-gray-800"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 relative z-10 custom-scrollbar">
                    {loadingConversations ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="h-8 w-8 text-blue-500/20 animate-spin" />
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-gray-600 animate-pulse">Syncing Network...</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {conversations.length === 0 ? (
                                <div className="p-10 text-center opacity-20 flex flex-col items-center gap-4">
                                    <Signal className="w-12 h-12" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active links detected</p>
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <button
                                        key={conv.user._id}
                                        onClick={() => setSelectedUser(conv.user._id)}
                                        className={`w-full p-4 rounded-[1.8rem] flex items-center gap-4 transition-all duration-300 group/item relative overflow-hidden
                                            ${selectedUser === conv.user._id
                                                ? 'bg-blue-600/10 border border-blue-500/30 shadow-xl shadow-blue-500/5'
                                                : 'bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10'}
                                        `}
                                    >
                                        {selectedUser === conv.user._id && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                        )}

                                        <div className="relative shrink-0">
                                            <Avatar className="h-12 w-12 border border-white/10 shadow-lg group-hover/item:scale-105 transition-transform">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 text-xs font-black">
                                                    {conv.user.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-black text-[13px] text-white uppercase tracking-tight truncate group-hover/item:text-blue-400 transition-colors">
                                                    {conv.user.username}
                                                </span>
                                                {conv.lastMessage && (
                                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-tighter">
                                                        {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 truncate leading-none font-medium italic opacity-70">
                                                {conv.lastMessage ? conv.lastMessage.content : "Inaugurate link sequence..."}
                                            </p>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/40 animate-bounce">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className={`flex-1 flex flex-col border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden transition-all duration-700 rounded-[2.5rem] shadow-2xl relative ${showListOnMobile ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-8 py-6 border-b border-white/10 flex items-center gap-5 bg-white/[0.02] relative z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-gray-400 hover:text-white hover:bg-white/5 rounded-xl mr-2"
                                onClick={() => setShowListOnMobile(true)}
                            >
                                <Search className="h-5 w-5 rotate-90" />
                            </Button>

                            <div className="relative">
                                <Avatar className="h-12 w-12 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                                    <AvatarFallback className="bg-indigo-600/20 text-indigo-400 text-xs font-black italic">
                                        {selectedUserData?.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="font-black text-lg text-white uppercase tracking-tight flex items-center gap-3">
                                    {selectedUserData?.username}
                                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] px-2 py-0.5 rounded-full">ACTIVE_NODE</span>
                                </h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{selectedUserData?.email}</p>
                            </div>

                            <div className="ml-auto hidden sm:flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">E2E_ENCRYPTED</span>
                                    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">TLS_RSA_X256</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 px-8 py-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent)] relative z-0">
                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30">
                                    <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                    <span className="text-[10px] uppercase font-black tracking-[0.5em] text-gray-500">Decrypting Transmission Logs...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center mt-20 p-12 text-center gap-6 border-2 border-dashed border-white/5 rounded-[3rem] opacity-30">
                                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                                        <MessageSquare className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-2">Initialize Connection Interface</p>
                                        <p className="text-xs text-gray-500 max-w-xs font-medium">Link established. Ready for encrypted packet exchange with terminal node {selectedUserData?.username}.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 max-w-5xl mx-auto">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderModel === 'Admin';
                                        return (
                                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                                <div className={`relative flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                                                    <div className={`p-4 md:p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${isMe
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none border border-blue-400/30'
                                                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                                                        }`}>
                                                        {isMe && <div className="absolute inset-0 bg-white/[0.05] pointer-events-none" />}
                                                        <p className="whitespace-pre-wrap font-medium relative z-10">{msg.content}</p>
                                                    </div>

                                                    <div className={`flex items-center gap-4 mt-2 px-2 transition-all duration-500 ${isMe ? 'flex-row-reverse opacity-0 group-hover/msg:opacity-100' : 'opacity-0 group-hover/msg:opacity-100'}`}>
                                                        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest italic">
                                                            {format(new Date(msg.createdAt), 'HH:mm:ss')}
                                                        </span>
                                                        <button
                                                            onClick={() => handleSaveMessage(msg._id, msg.isSaved)}
                                                            className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${msg.isSaved
                                                                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                                                : 'bg-white/5 border-white/10 text-gray-600 hover:text-white hover:border-white/20'}`}
                                                        >
                                                            {msg.isSaved ? (
                                                                <><div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" /> PROTECTED_LOG</>
                                                            ) : "PERSIST DATA"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-8 border-t border-white/10 bg-white/[0.02] backdrop-blur-2xl relative z-10">
                            <form onSubmit={handleSend} className="flex gap-4 max-w-5xl mx-auto group/input">
                                <div className="flex-1 relative">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Enter secure message packet..."
                                        className="h-16 pl-6 pr-12 bg-black/40 border-white/10 focus:border-blue-500/50 rounded-2xl text-white font-bold placeholder:text-gray-800 transition-all text-sm shadow-inner"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within/input:text-blue-500 transition-colors pointer-events-none">
                                        <Zap className="h-5 w-5 fill-current" />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-400/20 active:scale-95 transition-all group/btn"
                                    disabled={!newMessage.trim()}
                                >
                                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </Button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-8 opacity-20">
                                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5 grayscale group-hover/input:grayscale-0 transition-all">
                                    <Globe className="h-3 w-3" /> CDN_CORE:1.0.2
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5 grayscale group-hover/input:grayscale-0 transition-all">
                                    <Cpu className="h-3 w-3" /> EXEC_POD:R24
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-1.5 grayscale group-hover/input:grayscale-0 transition-all">
                                    <Terminal className="h-3 w-3" /> VER:19.4.0
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent)] relative group overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:rotate-12 transition-transform duration-1000">
                                    <User className="w-16 h-16 text-blue-500/20 group-hover:text-blue-500/40 transition-colors" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/40 border border-blue-400/30">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="text-center space-y-3">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Communication Hub</h4>
                                <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-[0.4em] font-black max-w-[320px] mx-auto italic">Estabish an encrypted data link by selecting an operative node from the frequency list.</p>
                            </div>
                            <div className="flex gap-4 opacity-30 grayscale pointer-events-none">
                                <Activity className="w-5 h-5" />
                                <Fingerprint className="w-5 h-5" />
                                <Cpu className="w-5 h-5" />
                                <Globe className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
