"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send } from "lucide-react";

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
                    title: "Broadcast Sent",
                    description: `Successfully sent to ${data.count} users.`,
                });
                setSubject("");
                setMessage("");
                setSendEmail(false);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send broadcast.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Broadcast Center</h1>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle>Create Announcement</CardTitle>
                            <CardDescription>Send a message to all registered users.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBroadcast} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject (Optional)</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Important Maintenance Update"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message Content</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                className="min-h-[200px]"
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                            <Switch
                                id="email-mode"
                                checked={sendEmail}
                                onCheckedChange={setSendEmail}
                            />
                            <div className="flex-1">
                                <Label htmlFor="email-mode" className="font-medium">Send via Email too</Label>
                                <p className="text-sm text-muted-foreground">If enabled, users will also receive an email notification.</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                "Broadcasting..."
                            ) : (
                                <>
                                    Send Broadcast <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
