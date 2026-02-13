import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";

export default function SupportPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Support Center</h1>
                <p className="text-muted-foreground text-lg">
                    Need help? Navigate our support resources or contact us.
                </p>
                <div className="mt-12 p-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground">
                    Support portal coming soon...
                </div>
            </div>
            <Footer />
        </main>
    );
}
