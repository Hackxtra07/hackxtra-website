import { connectDB } from "@/lib/mongodb";
import { News } from "@/lib/models";
import { Header } from "@/components/hackxtras/header";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "News | HackXtras",
    description: "Latest updates, articles, and announcements from HackXtras.",
};

async function getNews() {
    await connectDB();
    const news = await News.find({ isPublished: true }).sort({ publishedAt: -1, createdAt: -1 });
    return news;
}

export default async function NewsPage() {
    const news = await getNews();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 pt-32 pb-16">
                <div className="max-w-4xl mx-auto mb-12 text-center">
                    <h1 className="text-4xl font-display font-bold mb-4">Latest News</h1>
                    <p className="text-muted-foreground text-lg">
                        Stay updated with the latest trends in cybersecurity, platform updates, and community stories.
                    </p>
                </div>

                {news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item: any) => (
                            <div key={item._id} className="group relative flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                                {item.image && (
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                                {!item.image && (
                                    <div className="h-48 w-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                                        <span className="text-4xl">📰</span>
                                    </div>
                                )}

                                <div className="flex flex-col flex-1 p-6">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {item.author}
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h2>

                                    {/* Basic content preview - stripping HTML for safety in preview if needed, or just line clamp */}
                                    <div className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                        {item.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                    </div>

                                    <div className="mt-auto">
                                        <Link href={`/news/${item._id}`}>
                                            <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary">
                                                Read Article <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold mb-2">No news yet</h3>
                        <p className="text-muted-foreground">Check back later for updates!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
