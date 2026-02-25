"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
    children: React.ReactNode;
    title: string;
}

export function RequireAuth({ children, title }: RequireAuthProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("userToken");
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    if (isAuthenticated === null) {
        // Show a small loader while checking auth state
        return (
            <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-3">
                    Sign in to access {title}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                    You need an active account to view and access our premium {title.toLowerCase()}. Join our community of hackers and learners today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link href="/login" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto min-w-[120px]">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/signup" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto min-w-[120px]">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
