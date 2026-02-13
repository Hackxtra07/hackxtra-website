import { Header } from "@/components/hackxtras/header";
import { Footer } from "@/components/hackxtras/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
    return (
        <main className="relative min-h-screen bg-background pt-32">
            <Header />
            <div className="mx-auto max-w-7xl px-6">
                <h1 className="text-4xl font-bold tracking-tight mb-6">API Reference</h1>
                <p className="text-muted-foreground text-lg mb-12">
                    Technical documentation for developers integrating with HackXtras.
                </p>

                <Tabs defaultValue="intro" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="intro">Introduction</TabsTrigger>
                        <TabsTrigger value="auth">Authentication</TabsTrigger>
                        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    </TabsList>
                    <TabsContent value="intro" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Welcome to the HackXtras API</CardTitle>
                                <CardDescription>
                                    Our API empowers you to build custom integrations and extend the platform's capabilities.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">
                                    The HackXtras API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
                                </p>
                                <p>
                                    Base URL: <code className="bg-muted px-2 py-1 rounded">https://api.hackxtras.com/v1</code>
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="auth" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Authentication</CardTitle>
                                <CardDescription>
                                    Authenticate your requests using API keys.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">
                                    The HackXtras API uses API keys to authenticate requests. You can view and manage your API keys in the dashboard.
                                </p>
                                <p className="mb-4">
                                    Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
                                </p>
                                <div className="bg-muted p-4 rounded-md">
                                    <pre className="text-sm overflow-x-auto">
                                        Authorization: Bearer YOUR_API_KEY
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="endpoints" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tools Endpoint</CardTitle>
                                <CardDescription>
                                    Retrieve a list of available tools.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">GET</span>
                                    <code className="text-sm">/tools</code>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Returns a list of all tools available in the directory.
                                </p>
                                <div className="bg-muted p-4 rounded-md">
                                    <pre className="text-sm overflow-x-auto">
                                        {`[
  {
    "id": "tool_123",
    "name": "Nmap",
    "category": "Information Gathering"
  }
]`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </main>
    );
}
