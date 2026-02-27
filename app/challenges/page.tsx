'use client';

import { useEffect, useState } from 'react';
import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Challenge {
    _id: string;
    title: string;
    description: string;
    points: number;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    type: 'quiz' | 'ctf';
    options?: string[];
}

export default function ChallengesPage() {
    const { toast } = useToast();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [solvedIds, setSolvedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputs, setInputs] = useState<{ [key: string]: string }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDifficulty, setActiveDifficulty] = useState("All Difficulties");
    const [activeCategory, setActiveCategory] = useState("All Categories");

    const categories = ["All Categories", ...Array.from(new Set(challenges.map(c => c.category).filter(Boolean)))];
    const difficulties = ["All Difficulties", "Easy", "Medium", "Hard"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('userToken');

            // Fetch Challenges
            const resChallenges = await fetch('/api/challenges');
            const dataChallenges = await resChallenges.json();
            setChallenges(dataChallenges);

            // Fetch User Solves (if logged in)
            if (token) {
                const resProfile = await fetch('/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resProfile.ok) {
                    const dataProfile = await resProfile.json();
                    setSolvedIds(dataProfile.solvedChallenges || []);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChallenges = challenges.filter(challenge => {
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            challenge.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDifficulty = activeDifficulty === "All Difficulties" || challenge.difficulty === activeDifficulty;
        const matchesCategory = activeCategory === "All Categories" || challenge.category === activeCategory;

        return matchesSearch && matchesDifficulty && matchesCategory;
    });

    const handleSubmit = async (id: string) => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            toast({ title: 'Login Required', description: 'Please login to submit flags.', variant: "destructive" });
            return;
        }

        if (!inputs[id]) {
            toast({ title: 'Required', description: 'Please select or enter an answer.', variant: "destructive" });
            return;
        }

        try {
            const res = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    challengeId: id,
                    flag: inputs[id]
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast({ title: 'Correct!', description: `+${data.pointsAwarded} points awarded.` });
                setSolvedIds([...solvedIds, id]);
                // Refresh data to remove the solved challenge and show any new ones added by replenishment
                fetchData();
            } else {
                toast({ title: 'Incorrect', description: data.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Submission failed', variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-32 pb-24 px-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold mb-4 font-display">Earn Points</h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            Complete quizzes, solve challenges, and climb the leaderboard.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex flex-wrap gap-2">
                                {difficulties.map(diff => (
                                    <Button
                                        key={diff}
                                        variant={activeDifficulty === diff ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveDifficulty(diff)}
                                        className={activeDifficulty === diff ? "bg-primary" : "border-border/50 bg-card/30"}
                                    >
                                        {diff}
                                    </Button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-72">
                                <Input
                                    placeholder="Search challenges..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-card/30 pl-10"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <Button
                                    key={cat as string}
                                    variant={activeCategory === cat ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveCategory(cat as string)}
                                    className={activeCategory === cat ? "bg-primary" : "border-border/50 bg-card/30"}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">Loading challenges...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredChallenges.map((challenge, i) => {
                                const isSolved = solvedIds.includes(challenge._id);
                                return (
                                    <motion.div
                                        key={challenge._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className={`p-6 border border-border/50 h-full flex flex-col ${isSolved ? 'bg-green-500/5' : 'bg-card/30'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${challenge.difficulty === 'Easy' ? 'border-green-500/50 text-green-500' :
                                                        challenge.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-500' :
                                                            'border-red-500/50 text-red-500'
                                                        }`}>
                                                        {challenge.difficulty}
                                                    </span>
                                                    <span className="px-2 py-1 rounded text-xs font-medium border border-border bg-muted/50 uppercase">
                                                        {challenge.type || 'CTF'}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-primary font-mono font-bold">
                                                    {challenge.points} PTS
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                                {challenge.title}
                                                {isSolved && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                                {challenge.description}
                                            </p>

                                            {!isSolved ? (
                                                <div className="space-y-4">
                                                    {challenge.type === 'quiz' && challenge.options ? (
                                                        <div className="space-y-2">
                                                            {challenge.options.map((option, optIdx) => (
                                                                <div
                                                                    key={optIdx}
                                                                    onClick={() => setInputs({ ...inputs, [challenge._id]: option })}
                                                                    className={`p-3 rounded border cursor-pointer transition-colors text-sm ${inputs[challenge._id] === option
                                                                        ? 'border-primary bg-primary/10'
                                                                        : 'border-border/50 hover:bg-muted'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${inputs[challenge._id] === option ? 'border-primary' : 'border-muted-foreground'
                                                                            }`}>
                                                                            {inputs[challenge._id] === option && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                                        </div>
                                                                        {option}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Input
                                                            placeholder="flag{...}"
                                                            value={inputs[challenge._id] || ''}
                                                            onChange={(e) => setInputs({ ...inputs, [challenge._id]: e.target.value })}
                                                            className="bg-background/50"
                                                        />
                                                    )}

                                                    <Button
                                                        onClick={() => handleSubmit(challenge._id)}
                                                        className="w-full"
                                                        disabled={!inputs[challenge._id]}
                                                    >
                                                        Submit Answer
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="w-full py-2 bg-green-500/10 text-green-500 rounded text-center text-sm font-medium border border-green-500/20">
                                                    Solved
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
