'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from 'lucide-react';
import { useState } from "react";
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

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('coupons');
  const [couponTab, setCouponTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="daily-discounts">Daily Discounts</TabsTrigger>
          <TabsTrigger value="gift-cards">Gift Cards</TabsTrigger>
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
                Manage gift cards that customers can purchase and redeem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Gift cards content will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
