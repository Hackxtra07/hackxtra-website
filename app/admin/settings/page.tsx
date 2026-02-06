'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
    const { request, loading } = useApi();
    const { toast } = useToast();
    const [contactEmail, setContactEmail] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await request('/api/settings');
            if (data && data.contactEmail) {
                setContactEmail(data.contactEmail);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch settings', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await request('/api/settings', {
                method: 'PUT',
                body: { contactEmail },
            });
            toast({ title: 'Success', description: 'Settings updated!' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Global Settings</h1>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
                <p className="text-gray-500 mb-6">
                    Configure where all system emails (Contact Forms, Applications, Suggestions) should be sent.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                    <div>
                        <Label htmlFor="email">Alert Destination Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">This is where all form submissions will be forwarded.</p>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Settings'}
                    </Button>
                </form>
            </Card>

            <Card className="p-6 bg-yellow-50 border-yellow-200">
                <h2 className="text-xl font-semibold mb-2 text-yellow-800">SMTP Server Configuration</h2>
                <p className="text-sm text-yellow-700 mb-4">
                    To send emails properly, you must configure the SMTP credentials in your server environment variables (`.env`).
                </p>
                <div className="bg-white p-4 rounded border border-yellow-200 font-mono text-sm overflow-x-auto">
                    <p>SMTP_HOST=smtp.gmail.com</p>
                    <p>SMTP_PORT=587</p>
                    <p>SMTP_SECURE=false</p>
                    <p>SMTP_USER=your-email@gmail.com</p>
                    <p>SMTP_PASS=your-app-password</p>
                </div>
            </Card>
        </div>
    );
}
