"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Correct import for App Router
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    BookOpen,
    FlaskConical,
    Link as LinkIcon,
    Newspaper,
    Trophy,
    ShoppingBag,
    Tv,
    Hash,
    Loader2
} from "lucide-react";
import axios from "axios";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        const openSearch = () => setOpen(true);

        document.addEventListener("keydown", down);
        window.addEventListener("open-search", openSearch);

        return () => {
            document.removeEventListener("keydown", down);
            window.removeEventListener("open-search", openSearch);
        };
    }, []);

    React.useEffect(() => {
        if (!open) return; // Don't search if closed
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
                setResults(res.data.results || []);
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, open]);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    // Group results by type
    const groupedResults = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        results.forEach((item) => {
            if (!groups[item.type]) {
                groups[item.type] = [];
            }
            groups[item.type].push(item);
        });
        return groups;
    }, [results]);

    const getIcon = (type: string) => {
        switch (type) {
            case "Course": return <BookOpen className="mr-2 h-4 w-4" />;
            case "Lab": return <FlaskConical className="mr-2 h-4 w-4" />;
            case "Resource": return <LinkIcon className="mr-2 h-4 w-4" />;
            case "News": return <Newspaper className="mr-2 h-4 w-4" />;
            case "Challenge": return <Trophy className="mr-2 h-4 w-4" />;
            case "Store": return <ShoppingBag className="mr-2 h-4 w-4" />;
            case "Documentary": return <Tv className="mr-2 h-4 w-4" />;
            case "Channel": return <Hash className="mr-2 h-4 w-4" />;
            default: return <BookOpen className="mr-2 h-4 w-4" />;
        }
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Type a command or search..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>
                    {loading ? (
                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                        </div>
                    ) : (
                        "No results found."
                    )}
                </CommandEmpty>

                {Object.entries(groupedResults).map(([type, items]) => (
                    <CommandGroup key={type} heading={`${type}s`}>
                        {items.map((item) => (
                            <CommandItem
                                key={item.id}
                                value={`${item.title} ${item.description || ''}`} // For filtering if cmdk does client side filtering on top
                                onSelect={() => {
                                    runCommand(() => {
                                        if (item.isExternal) {
                                            window.open(item.url, '_blank');
                                        } else {
                                            router.push(item.url);
                                        }
                                    });
                                }}
                            >
                                {getIcon(type)}
                                <div className="flex flex-col">
                                    <span>{item.title}</span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}

                {results.length > 0 && <CommandSeparator />}
            </CommandList>
        </CommandDialog>
    );
}
