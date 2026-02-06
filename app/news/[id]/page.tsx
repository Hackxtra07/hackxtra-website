import { connectDB } from "@/lib/mongodb";
import { News } from "@/lib/models";
import { Header } from "@/components/hackxtras/header";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force simple rendering for now, can improve with actual MDX or sanitizer later if needed
// For now assuming content is safe HTML or plain text. 
// If storing HTML from textarea in admin, we should be careful. 
// For this MVP, we will render it inside a div, but ideally sanitize.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    await connectDB();
    const { id } = await params;
    try {
        const newsItem = await News.findById(id);
        if (!newsItem) return { title: 'News Not Found' };

        return {
            title: `${newsItem.title} | HackXtras`,
            description: newsItem.content.substring(0, 160),
            openGraph: {
                images: newsItem.image ? [newsItem.image] : [],
            },
        };
    } catch (e) {
        return { title: 'Error' };
    }
}

async function getNewsItem(id: string) {
    try {
        await connectDB();
        const newsItem = await News.findById(id);
        return newsItem;
    } catch (e) {
        return null;
    }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await getNewsItem(id);

    if (!item || (!item.isPublished)) { // Optionally show if admin? But this is public page.
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-6 pt-32 pb-16">
                <Link href="/news" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
                </Link>

                <article className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(item.publishedAt || item.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {item.author}
                            </span>
                            {item.timeToRead && (
                                <span>• {item.timeToRead} min read</span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground leading-tight">
                            {item.title}
                        </h1>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {item.tags && item.tags.map((tag: string) => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {item.image && (
                        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-2xl border border-border/50">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}



                    <div className="prose prose-invert prose-lg max-w-none">
                        <div
                            className="font-sans text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                    </div>

                    <div className="mt-16 pt-8 border-t border-border/50 flex justify-between items-center">
                        <div className="text-muted-foreground">
                            Share this article
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" title="Copy Link">
                                <Share2 className="h-4 w-4" />
                            </Button>
                            {/* Add social share buttons later */}
                        </div>
                    </div>

                </article>
            </main>
        </div>
    );
}
