import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Blog</h1>
                <p className="text-muted-foreground text-lg mb-12">
                    Stay tuned for the latest news, updates, and articles from the HackXtras team.
                </p>

                <div className="space-y-12">
                    {/* Featured Post */}
                    <section>
                        <Card className="overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="h-64 md:h-auto bg-zinc-100 flex items-center justify-center">
                                    <span className="text-zinc-400">Featured Image Placeholder</span>
                                </div>
                                <div className="p-6 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge>Announcement</Badge>
                                        <span className="text-sm text-muted-foreground">October 24, 2025</span>
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4">Introducing HackXtras Pro</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Unlock the full potential of your security assessments with our new Pro tier.
                                        Advanced reporting, unlimited history, and priority support.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-700 font-bold">
                                            JD
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">John Doe</div>
                                            <div className="text-xs text-muted-foreground">Product Manager</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>

                    {/* Recent Posts */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Recent Articles</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="flex flex-col">
                                    <div className="h-48 bg-zinc-100 flex items-center justify-center rounded-t-xl">
                                        <span className="text-zinc-400">Image Placeholder</span>
                                    </div>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline">Tutorial</Badge>
                                            <span className="text-xs text-muted-foreground">Sept {10 + i}, 2025</span>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">Getting Started with Ethical Hacking</h3>
                                        <p className="text-muted-foreground text-sm mb-4 flex-1">
                                            A beginner's guide to understanding the basics of penetration testing and security analysis.
                                        </p>
                                        <Button variant="ghost" className="p-0 h-auto justify-start font-semibold">
                                            Read Article &rarr;
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
