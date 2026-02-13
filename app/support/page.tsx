import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Support Center</h1>
                <p className="text-muted-foreground text-lg mb-12">
                    Need help? Navigate our support resources or contact us.
                </p>

                <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                                <AccordionContent>
                                    You can reset your password by clicking on the "Forgot Password" link on the login page.
                                    Follow the instructions sent to your email to create a new password.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Where can I find API documentation?</AccordionTrigger>
                                <AccordionContent>
                                    Our API documentation is available in the "API Reference" section of the website.
                                    You can find detailed endpoints and usage examples there.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>How do I contact support?</AccordionTrigger>
                                <AccordionContent>
                                    You can contact our support team by emailing support@hackxtras.com or using the contact form on this page.
                                    We aim to respond to all inquiries within 24 hours.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Contact Us</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle>Get in Touch</CardTitle>
                                <CardDescription>
                                    Fill out the form below and our team will get back to you shortly.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="Enter your email" type="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="What can we help you with?" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Type your message here." />
                                </div>
                                <Button className="w-full">Send Message</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
