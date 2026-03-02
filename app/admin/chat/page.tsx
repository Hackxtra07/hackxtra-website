"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, User } from "lucide-react";
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
        <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col md:flex-row gap-0 md:gap-6 p-0 md:p-6 overflow-hidden">
            {/* Sidebar List */}
            <Card className={`w-full md:w-1/3 flex flex-col border-none md:border border-white/10 bg-black md:bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-300 ${!showListOnMobile ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 md:p-6 border-b border-white/10">
                    <h2 className="font-bold text-xl mb-4 text-white">Security Channels</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Search frequency..." className="pl-9 bg-white/5 border-white/10 text-white text-xs h-10" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {loadingConversations ? (
                        <div className="p-10 text-center text-gray-500 animate-pulse text-xs uppercase tracking-widest">Scanning Frequencies...</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.user._id}
                                    onClick={() => setSelectedUser(conv.user._id)}
                                    className={`w-full p-4 md:p-5 flex items-start gap-3 hover:bg-white/5 transition-all text-left group
                                        ${selectedUser === conv.user._id ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}
                                    `}
                                >
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-white/10">
                                            <AvatarFallback className="bg-blue-500/10 text-blue-400 text-xs font-bold">{conv.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold text-sm text-gray-200 truncate group-hover:text-white transition-colors">{conv.user.username}</span>
                                            {conv.lastMessage && (
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {format(new Date(conv.lastMessage.createdAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate leading-relaxed">
                                            {conv.lastMessage ? conv.lastMessage.content : "Initialize encrypted link..."}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className={`flex-1 flex flex-col border-none md:border border-white/10 bg-black md:bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-300 ${showListOnMobile ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        <div className="p-4 md:p-5 border-b border-white/10 flex items-center gap-3 bg-white/5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-gray-400 hover:text-white"
                                onClick={() => setShowListOnMobile(true)}
                            >
                                <Search className="h-5 w-5 rotate-90" />
                            </Button>
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarFallback className="bg-indigo-500/10 text-indigo-400 text-xs font-bold">{selectedUserData?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm text-white truncate">{selectedUserData?.username}</h3>
                                <p className="text-[10px] text-gray-500 font-mono truncate">{selectedUserData?.email}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Encrypted</span>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4 md:p-6 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.03),transparent)]">
                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500/20 border-t-blue-500" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Decrypting Archive...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20 p-10 border border-dashed border-white/10 rounded-2xl">
                                    <p className="text-xs uppercase tracking-widest font-bold mb-2">Secure Link Established</p>
                                    <p className="text-xs">Start a secure transmission with {selectedUserData?.username}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderModel === 'Admin';
                                        return (
                                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`group relative flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                                                    <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${isMe
                                                        ? 'bg-blue-600 text-white rounded-tr-none border border-blue-500'
                                                        : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                                                        }`}>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-3 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        <p className="text-[10px] text-gray-500 font-mono">
                                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                                        </p>
                                                        <button
                                                            onClick={() => handleSaveMessage(msg._id, msg.isSaved)}
                                                            className={`text-[9px] uppercase font-bold tracking-tight transition-all flex items-center gap-1 ${msg.isSaved ? 'text-blue-400' : 'text-gray-600 opacity-0 group-hover:opacity-100'}`}
                                                        >
                                                            {msg.isSaved ? (
                                                                <>
                                                                    <div className="h-1 w-1 rounded-full bg-blue-400" />
                                                                    Protected
                                                                </>
                                                            ) : "Save Log"}
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

                        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                            <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Enter encrypted message..."
                                    className="flex-1 bg-black/50 border-white/10 text-white text-sm h-11 focus:ring-blue-500"
                                />
                                <Button type="submit" size="icon" className="h-11 w-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 shrink-0">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-10 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent)]">
                        <div className="text-center max-w-sm">
                            <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <User className="w-10 h-10 text-blue-500/30" />
                            </div>
                            <h4 className="text-white font-bold text-lg mb-2">Secure Communications</h4>
                            <p className="text-gray-500 text-xs leading-relaxed uppercase tracking-widest font-medium">Select a target frequency to begin data transmission monitor.</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

