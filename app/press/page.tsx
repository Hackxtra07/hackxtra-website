import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

export default function PressPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Press Resources</h1>
                <p className="text-muted-foreground text-lg">
                    Brand assets, media kit, and press releases.
                </p>
                <div className="mt-12 p-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground">
                    Press kit coming soon...
                </div>
            </div>
            <Footer />
        </main>
    );
}
