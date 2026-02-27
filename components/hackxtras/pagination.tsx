"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = "",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("ellipsis-start");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis-end");
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages.map((page, index) => {
            if (typeof page === "string") {
                return (
                    <div
                        key={page}
                        className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </div>
                );
            }

            const isActive = currentPage === page;

            return (
                <Button
                    key={page}
                    variant={isActive ? "default" : "outline"}
                    size="icon"
                    onClick={() => onPageChange(page)}
                    className={`h-9 w-9 border-border/50 transition-all duration-200 ${isActive
                            ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(39,97,195,0.4)]"
                            : "bg-background/50 hover:bg-muted hover:text-primary hover:border-primary/50"
                        }`}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 border-border/50 bg-background/50 hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">{renderPageNumbers()}</div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 border-border/50 bg-background/50 hover:bg-muted disabled:opacity-30 transition-all duration-200"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
