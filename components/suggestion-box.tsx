"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SuggestionBox() {
    const { toast } = useToast();
    const [suggestion, setSuggestion] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!suggestion.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'suggestion',
                    data: { suggestion }
                }),
            });

            if (res.ok) {
                toast({ title: "Suggestion Sent", description: "Thanks for your feedback!" });
                setSuggestion("");
            } else {
                throw new Error('Failed to send');
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not send suggestion", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="p-6 border-border/50 bg-card/30 backdrop-blur-sm mt-12">
            <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Anonymous Suggestion Box</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Have an idea to improve the platform? Let us know! (Your email is not recorded unless you include it)
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    placeholder="I think you should add..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="min-h-[100px] bg-background/50 resize-none"
                />
                <Button type="submit" size="sm" variant="secondary" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Suggestion'}
                </Button>
            </form>
        </Card>
    );
}
