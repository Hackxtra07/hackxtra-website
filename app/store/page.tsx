'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Coins, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/hackxtras/header';
import { Footer } from '@/components/hackxtras/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface StoreItem {
    _id: string;
    title: string;
    description: string;
    cost: number;
    type: string;
    image?: string;
    stock: number;
}

interface Transaction {
    _id: string;
    itemTitle: string;
    itemType: string;
    cost: number;
    value: string;
    createdAt: string;
}

export default function StorePage() {
    const { request, loading } = useApi('user');
    const [items, setItems] = useState<StoreItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userPoints, setUserPoints] = useState<number | null>(null);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseResult, setPurchaseResult] = useState<{ value: string; title: string, type: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
        fetchTransactions();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch store items
            try {
                const storeData = await request('/api/store');
                setItems(storeData);
            } catch (e) {
                console.error('Failed to fetch store items', e);
            }

            // Fetch user points (might fail if not logged in)
            try {
                const userData = await request('/api/user/points');
                if (userData && typeof userData.points === 'number') {
                    setUserPoints(userData.points);
                }
            } catch (e) {
                console.log('User not logged in or failed to fetch points');
            }
        } catch (error) {
            console.error('Unexpected error in fetchData', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const data = await request('/api/user/transactions');
            setTransactions(data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        }
    };

    const handleCreatePurchase = (item: StoreItem) => {
        console.log('Purchase clicked for:', item.title, 'User Points:', userPoints);
        if (userPoints === null) {
            toast.error("Please log in to purchase items");
            return;
        }
        setSelectedItem(item);
        setShowConfirm(true);
    };

    const confirmPurchase = async () => {
        if (!selectedItem) return;

        setPurchasing(true);
        try {
            const response = await request('/api/store/purchase', {
                method: 'POST',
                body: { itemId: selectedItem._id }
            });

            if (response && response.success) {
                setUserPoints(response.newBalance);
                setPurchaseResult(response.item);
                setShowConfirm(false);
                toast.success('Purchase successful!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Purchase failed');
            setShowConfirm(false);
        } finally {
            setPurchasing(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="flex-grow pt-24 px-6">
                <div className="container mx-auto space-y-8 pb-16">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Store
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Redeem your hard-earned points for exclusive deals and resources.
                            </p>
                        </div>

                        {userPoints !== null && (
                            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-full font-bold text-lg border border-yellow-200 dark:border-yellow-800">
                                <Coins className="w-5 h-5" />
                                <span>{userPoints} Points</span>
                            </div>
                        )}
                    </div>

                    <Tabs defaultValue="browse" className="w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <TabsList className="grid w-full md:w-auto grid-cols-2 min-w-[300px]">
                                <TabsTrigger value="browse">Browse Store</TabsTrigger>
                                <TabsTrigger value="history" onClick={fetchTransactions}>My Purchases</TabsTrigger>
                            </TabsList>

                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-border/50 bg-background/50 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <TabsContent value="browse" className="mt-0">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {items.length === 0 ? "Loading items..." : `No items found matching "${searchQuery}"`}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredItems.map((item) => (
                                        <Card key={item._id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-6 text-center">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <div className="text-4xl">🛍️</div>
                                                )}
                                            </div>
                                            <CardHeader>
                                                <div className="flex justify-between items-start gap-2">
                                                    <CardTitle className="text-xl line-clamp-1" title={item.title}>{item.title}</CardTitle>
                                                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded capitalize">
                                                        {item.type}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                                    {item.description}
                                                </p>
                                                {item.stock !== -1 && (
                                                    <p className={`text-xs font-semibold ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                        {item.stock > 0 ? `${item.stock} left in stock` : 'Out of Stock'}
                                                    </p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="pt-4 border-t">
                                                <Button
                                                    onClick={() => handleCreatePurchase(item)}
                                                    disabled={userPoints !== null && userPoints < item.cost || (item.stock !== -1 && item.stock <= 0)}
                                                    className="w-full flex justify-between items-center group"
                                                    variant={userPoints !== null && userPoints >= item.cost ? "default" : "secondary"}
                                                >
                                                    <span>Redeem</span>
                                                    <span className="flex items-center gap-1 bg-black/10 px-2 py-0.5 rounded">
                                                        <Coins className="w-3 h-3" />
                                                        {item.cost}
                                                    </span>
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Purchase History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {transactions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            You haven't purchased anything yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {transactions.map((tx) => (
                                                <div key={tx._id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                                    <div className="space-y-1">
                                                        <h3 className="font-semibold">{tx.itemTitle}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            {tx.itemType && (
                                                                <span className="capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{tx.itemType}</span>
                                                            )}
                                                            <span>• {format(new Date(tx.createdAt), 'PPT')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                                        <div className="flex items-center text-yellow-600 dark:text-yellow-500 font-medium">
                                                            <Coins className="w-4 h-4 mr-1" />
                                                            -{tx.cost}
                                                        </div>
                                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs font-mono select-all cursor-pointer" title="Click to copy">
                                                            {tx.value}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Confirmation Dialog */}
                    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Purchase</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to spend <b>{selectedItem?.cost} points</b> to redeem "<b>{selectedItem?.title}</b>"?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                                <Button onClick={confirmPurchase} disabled={purchasing}>
                                    {purchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Result Dialog */}
                    <Dialog open={!!purchaseResult} onOpenChange={(open) => {
                        if (!open) {
                            setPurchaseResult(null);
                            fetchTransactions(); // Refresh history on close
                        }
                    }}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <DialogTitle className="text-center">Redemption Successful!</DialogTitle>
                                <DialogDescription className="text-center">
                                    Here is your {purchaseResult?.type}:
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2 bg-slate-100 p-4 rounded-md overflow-x-auto">
                                <code className="text-sm font-mono break-all">{purchaseResult?.value}</code>
                            </div>
                            <DialogFooter className="sm:justify-center">
                                <Button type="button" variant="secondary" onClick={() => {
                                    setPurchaseResult(null);
                                    fetchTransactions();
                                }}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Footer />
        </main>
    );
}
