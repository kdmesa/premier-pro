'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
};

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'active' | 'inactive'>('active');
  const [coupons] = useState<Coupon[]>([
    { id: '1', code: 'WELCOME10', description: 'New users', discountType: 'percentage', discountValue: 10, active: true },
    { id: '2', code: 'SAVE5', description: 'Fixed off', discountType: 'fixed', discountValue: 5, active: true },
    { id: '3', code: 'OLD50', description: 'Expired campaign', discountType: 'percentage', discountValue: 50, active: false },
  ]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return coupons
      .filter(c => (tab === 'active' ? c.active : !c.active))
      .filter(c => !term || c.code.toLowerCase().includes(term) || (c.description || '').toLowerCase().includes(term));
  }, [coupons, search, tab]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'inactive')}>
            <TabsList className="bg-transparent p-0 h-auto">
              <TabsTrigger
                value="active"
                className="rounded-none bg-transparent px-0 mr-6 text-sm text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100"
              >
                Active coupons
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="rounded-none bg-transparent px-0 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent relative after:absolute after:left-0 after:-bottom-2 after:h-0.5 after:w-full after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100"
              >
                Inactive coupons
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full max-w-md ml-auto">
            <div className="relative w-full">
              <Input
                placeholder="Search by coupon name or code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button asChild>
              <Link href="/admin/marketing/coupons/new" className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Add New
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'inactive')}>
        <TabsContent value="active">
          <CouponTable rows={filtered} />
        </TabsContent>
        <TabsContent value="inactive">
          <CouponTable rows={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CouponTable({ rows }: { rows: Coupon[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No coupons found.</TableCell>
            </TableRow>
          ) : (
            rows.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{c.code}</TableCell>
                <TableCell>{c.description || '-'}</TableCell>
                <TableCell>
                  {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                </TableCell>
                <TableCell>{c.active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
