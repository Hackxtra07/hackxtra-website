import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

export default function BlogPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Blog</h1>
                <p className="text-muted-foreground text-lg">
                    Stay tuned for the latest news, updates, and articles from the HackXtras team.
                </p>
                <div className="mt-12 p-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground">
                    Content coming soon...
                </div>
            </div>
            <Footer />
        </main>
    );
}
