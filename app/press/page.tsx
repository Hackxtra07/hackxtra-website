import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PressPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Press Resources</h1>
                <p className="text-muted-foreground text-lg mb-12">
                    Brand assets, media kit, and press releases.
                </p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">About HackXtras</h2>
                        <p className="text-muted-foreground leading-relaxed max-w-3xl">
                            HackXtras is a leading platform providing advanced cybersecurity tools and resources for ethical hackers and security professionals.
                            Our mission is to democratize access to powerful security testing capabilities while promoting responsible disclosure and ethical hacking practices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Media Assets</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <div className="h-40 bg-zinc-100 flex items-center justify-center rounded-t-xl">
                                    <span className="font-bold text-2xl text-zinc-800">Logo Dark</span>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">Primary Logo (Dark)</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">PNG</Button>
                                        <Button variant="outline" size="sm">SVG</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <div className="h-40 bg-zinc-900 flex items-center justify-center rounded-t-xl">
                                    <span className="font-bold text-2xl text-white">Logo Light</span>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">Primary Logo (Light)</h3>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">PNG</Button>
                                        <Button variant="outline" size="sm">SVG</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Press Releases</h2>
                        <div className="space-y-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-sm text-muted-foreground mb-2">October 24, 2025</div>
                                    <h3 className="text-xl font-semibold mb-2">HackXtras Launches New AI-Powered Security Tools</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Today marks the release of our new suite of AI-driven vulnerability assessment tools...
                                    </p>
                                    <Button variant="link" className="p-0 h-auto">Read More &rarr;</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="text-sm text-muted-foreground mb-2">August 15, 2025</div>
                                    <h3 className="text-xl font-semibold mb-2">Partnership Announcement: Protecting the Future</h3>
                                    <p className="text-muted-foreground mb-4">
                                        We are thrilled to announce our strategic partnership with global security leaders...
                                    </p>
                                    <Button variant="link" className="p-0 h-auto">Read More &rarr;</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Press Contact</h2>
                        <p className="text-muted-foreground">
                            For press inquiries, please contact <a href="mailto:press@hackxtras.com" className="text-blue-600 hover:underline">press@hackxtras.com</a>.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
