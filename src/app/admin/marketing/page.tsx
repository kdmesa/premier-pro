'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, PlusCircle } from 'lucide-react';
import { useEffect, useState } from "react";
import { DailyDiscountsForm } from "@/components/admin/marketing/DailyDiscountsForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

type Coupon = {
  id: string;
  code: string;
  description: string;
  discount: string;
  status: 'active' | 'inactive';
};

type GiftCard = {
  id: string;
  name: string;
  code: string;
  amount: number;
  active: boolean;
};

type ScriptCategory = 'Cold Calling' | 'Follow-up' | 'SMS';

type Script = {
  id: string;
  title: string;
  category: ScriptCategory;
  content: string;
  updatedAt: string;
};

const GIFT_CARDS_KEY = 'marketingGiftCards';
const SCRIPTS_KEY = 'marketingScripts';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('coupons');
  const [couponTab, setCouponTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [newGiftCard, setNewGiftCard] = useState({ name: '', code: '', amount: '' });
  const [scripts, setScripts] = useState<Script[]>([]);
  const [newScript, setNewScript] = useState<{ title: string; category: ScriptCategory; content: string }>({
    title: '',
    category: 'Cold Calling',
    content: '',
  });
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  // Load and seed local data for gift cards and scripts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedGiftCards = JSON.parse(localStorage.getItem(GIFT_CARDS_KEY) || '[]') as GiftCard[];
      if (Array.isArray(storedGiftCards) && storedGiftCards.length > 0) {
        setGiftCards(storedGiftCards);
      } else {
        const seed: GiftCard[] = [
          { id: 'GC-001', name: 'New Customer Gift', code: 'WELCOME50', amount: 50, active: true },
          { id: 'GC-002', name: 'Holiday Gift', code: 'HOLIDAY100', amount: 100, active: false },
        ];
        setGiftCards(seed);
        localStorage.setItem(GIFT_CARDS_KEY, JSON.stringify(seed));
      }
    } catch {
      // ignore
    }

    try {
      const storedScripts = JSON.parse(localStorage.getItem(SCRIPTS_KEY) || '[]') as Script[];
      if (Array.isArray(storedScripts) && storedScripts.length > 0) {
        setScripts(storedScripts);
        setSelectedScriptId(storedScripts[0]?.id ?? null);
      } else {
        const now = new Date().toISOString();
        const seed: Script[] = [
          {
            id: 'SC-001',
            title: 'Cold call – new leads',
            category: 'Cold Calling',
            content:
              "Hi [Name], this is [Your Name] from [Company]. We work with busy homeowners in [City] to keep their homes consistently clean.\n\nI’m calling because we’re helping clients save time with online booking and automatic reminders. Would you be open to a quick 2‑minute overview to see if it could work for you?",
            updatedAt: now,
          },
          {
            id: 'SC-002',
            title: 'Follow‑up after quote',
            category: 'Follow-up',
            content:
              "Hi [Name], it’s [Your Name] from [Company]. I just wanted to follow up on the quote we sent for your cleaning on [Date].\n\nDo you have any questions about the service or schedule that I can answer for you today?",
            updatedAt: now,
          },
        ];
        setScripts(seed);
        setSelectedScriptId(seed[0].id);
        localStorage.setItem(SCRIPTS_KEY, JSON.stringify(seed));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const coupons: Coupon[] = [
    { id: '1', code: 'WELCOME10', description: 'New users', discount: '10%', status: 'active' },
    { id: '2', code: 'SAVE5', description: 'Fixed off', discount: '$5.00', status: 'active' },
    { id: '3', code: 'OLD50', description: 'Expired campaign', discount: '50%', status: 'inactive' },
  ];

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return coupon.status === couponTab && matchesSearch;
  });

  const saveGiftCards = (next: GiftCard[]) => {
    setGiftCards(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GIFT_CARDS_KEY, JSON.stringify(next));
    }
  };

  const handleAddGiftCard = () => {
    const amountNumber = Number(newGiftCard.amount);
    if (!newGiftCard.name || !newGiftCard.code || isNaN(amountNumber) || amountNumber <= 0) {
      return;
    }

    const next: GiftCard[] = [
      {
        id: `GC-${Date.now()}`,
        name: newGiftCard.name.trim(),
        code: newGiftCard.code.trim().toUpperCase(),
        amount: amountNumber,
        active: true,
      },
      ...giftCards,
    ];
    saveGiftCards(next);
    setNewGiftCard({ name: '', code: '', amount: '' });
  };

  const toggleGiftCardActive = (id: string) => {
    const next = giftCards.map((gc) =>
      gc.id === id ? { ...gc, active: !gc.active } : gc
    );
    saveGiftCards(next);
  };

  const deleteGiftCard = (id: string) => {
    const next = giftCards.filter((gc) => gc.id !== id);
    saveGiftCards(next);
  };

  const saveScripts = (next: Script[]) => {
    setScripts(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(next));
    }
  };

  const handleSaveScript = () => {
    if (!newScript.title.trim() || !newScript.content.trim()) return;

    const now = new Date().toISOString();
    const script: Script = {
      id: `SC-${Date.now()}`,
      title: newScript.title.trim(),
      category: newScript.category,
      content: newScript.content.trim(),
      updatedAt: now,
    };

    const next = [script, ...scripts];
    saveScripts(next);
    setSelectedScriptId(script.id);
    setNewScript({ title: '', category: 'Cold Calling', content: '' });
  };

  const selectedScript = scripts.find((s) => s.id === selectedScriptId) ?? scripts[0];

  const deleteScript = (id: string) => {
    const next = scripts.filter((s) => s.id !== id);
    saveScripts(next);
    if (selectedScriptId === id) {
      setSelectedScriptId(next[0]?.id ?? null);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="daily-discounts">Daily Discounts</TabsTrigger>
          <TabsTrigger value="gift-cards">Gift Cards</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="coupons">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>
                    Create and manage discount coupons for your customers.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search coupons..."
                      className="pl-9 h-10 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/admin/marketing/coupons/new" className="inline-flex items-center gap-2 whitespace-nowrap">
                      <PlusCircle className="h-4 w-4" /> Add Coupon
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={couponTab} onValueChange={setCouponTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="active">Active coupons</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive coupons</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Discount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCoupons.length > 0 ? (
                          filteredCoupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                              <TableCell className="font-medium">{coupon.code}</TableCell>
                              <TableCell>{coupon.description}</TableCell>
                              <TableCell>{coupon.discount}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                              No coupons found. Create your first coupon to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="inactive" className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Discount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCoupons.length > 0 ? (
                          filteredCoupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                              <TableCell className="font-medium">{coupon.code}</TableCell>
                              <TableCell>{coupon.description}</TableCell>
                              <TableCell>{coupon.discount}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                              No inactive coupons found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily-discounts">
          <DailyDiscountsForm />
        </TabsContent>
        
        <TabsContent value="gift-cards">
          <Card>
            <CardHeader>
              <CardTitle>Gift Cards</CardTitle>
              <CardDescription>
                Create digital gift cards your customers can purchase and redeem on bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create gift card form */}
              <div className="grid gap-3 md:grid-cols-[2fr_2fr_1fr_auto]">
                <Input
                  placeholder="Gift card name (e.g. New customer gift)"
                  value={newGiftCard.name}
                  onChange={(e) => setNewGiftCard((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Code (e.g. WELCOME50)"
                  value={newGiftCard.code}
                  onChange={(e) => setNewGiftCard((prev) => ({ ...prev, code: e.target.value }))}
                />
                <Input
                  type="number"
                  min={1}
                  placeholder="Amount"
                  value={newGiftCard.amount}
                  onChange={(e) => setNewGiftCard((prev) => ({ ...prev, amount: e.target.value }))}
                />
                <Button onClick={handleAddGiftCard} className="whitespace-nowrap">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Gift cards table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                          <TableHead className="w-[140px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftCards.length > 0 ? (
                      giftCards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-medium">{card.name}</TableCell>
                          <TableCell>{card.code}</TableCell>
                          <TableCell>${card.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                card.active
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {card.active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleGiftCardActive(card.id)}
                            >
                              {card.active ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => deleteGiftCard(card.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                          No gift cards yet. Create your first one above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts">
          <Card>
            <CardHeader>
              <CardTitle>Scripts</CardTitle>
              <CardDescription>
                Store and share cold‑calling, follow‑up, and SMS scripts so your team stays on message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New script form */}
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                  <Input
                    placeholder="Script title (e.g. Cold call – new leads)"
                    value={newScript.title}
                    onChange={(e) => setNewScript((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={newScript.category}
                    onChange={(e) =>
                      setNewScript((prev) => ({ ...prev, category: e.target.value as ScriptCategory }))
                    }
                  >
                    <option value="Cold Calling">Cold Calling</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <Textarea
                  rows={5}
                  placeholder="Write your script here..."
                  value={newScript.content}
                  onChange={(e) => setNewScript((prev) => ({ ...prev, content: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button onClick={handleSaveScript}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Save Script
                  </Button>
                </div>
              </div>

              {/* Scripts list + preview */}
              <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-md border bg-muted/30 max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Saved scripts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scripts.length > 0 ? (
                        scripts.map((script) => (
                          <TableRow
                            key={script.id}
                            className={`cursor-pointer ${
                              selectedScript && script.id === selectedScript.id ? 'bg-primary/5' : ''
                            }`}
                          >
                            <TableCell>
                              <div
                                className="w-full text-left"
                                onClick={() => setSelectedScriptId(script.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedScriptId(script.id);
                                  }
                                }}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="text-sm font-medium">{script.title}</div>
                                      <div className="text-[11px] text-muted-foreground">
                                        {script.category} • {new Date(script.updatedAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScript(script.id);
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell className="h-20 text-center text-muted-foreground">
                            No scripts yet. Add your first script above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="rounded-md border p-4 min-h-[200px] bg-white">
                  {selectedScript ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold">{selectedScript.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {selectedScript.category} •{" "}
                            {new Date(selectedScript.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <pre className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                        {selectedScript.content}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a script on the left to preview it here.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
