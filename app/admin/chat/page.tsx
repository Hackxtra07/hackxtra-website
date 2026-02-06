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

    return (
        <div className="h-[calc(100vh-100px)] p-6 flex gap-6">
            {/* Sidebar List */}
            <Card className="w-1/3 flex flex-col border-border/50 overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." className="pl-9" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {loadingConversations ? (
                        <div className="p-4 text-center">Loading users...</div>
                    ) : (
                        <div className="divide-y">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.user._id}
                                    onClick={() => setSelectedUser(conv.user._id)}
                                    className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left
                                        ${selectedUser === conv.user._id ? 'bg-muted' : ''}
                                    `}
                                >
                                    <Avatar>
                                        <AvatarFallback>{conv.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-medium truncate">{conv.user.username}</span>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(conv.lastMessage.createdAt), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {conv.lastMessage ? conv.lastMessage.content : "Start a conversation"}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="w-5 h-5 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
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
            <Card className="flex-1 flex flex-col border-border/50 overflow-hidden">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3 bg-muted/30">
                            <Avatar>
                                <AvatarFallback>{selectedUserData?.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold">{selectedUserData?.username}</h3>
                                <p className="text-xs text-muted-foreground">{selectedUserData?.email}</p>
                            </div>
                            <div className="ml-auto text-xs text-muted-foreground">
                                Messages are ephemeral unless saved
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            {loadingMessages ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted-foreground mt-20">
                                    <p>Start a new conversation with {selectedUserData?.username}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg) => {
                                        const isMe = msg.senderModel === 'Admin';
                                        return (
                                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-3 rounded-2xl max-w-[80%] group relative ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <div className="flex items-center justify-between gap-2 mt-1">
                                                        <p className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {format(new Date(msg.createdAt), 'h:mm a')}
                                                        </p>
                                                        <button
                                                            onClick={() => handleSaveMessage(msg._id, msg.isSaved)}
                                                            className={`text-[10px] hover:underline ${msg.isSaved ? 'font-bold' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}
                                                        >
                                                            {msg.isSaved ? "Saved" : "Save"}
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

                        <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Select a user to view conversation</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
