import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

export default function DocsPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Documentation</h1>
                <p className="text-muted-foreground text-lg">
                    Comprehensive guides and references for the HackXtras platform.
                </p>
                <div className="mt-12 p-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground">
                    Documentation is being updated...
                </div>
            </div>
            <Footer />
        </main>
    );
}
