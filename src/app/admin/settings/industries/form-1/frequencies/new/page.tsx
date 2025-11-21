"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FrequencyNewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const industry = params.get("industry") || "Industry";
  const editId = params.get("editId") ? Number(params.get("editId")) : null;

  type Row = {
    id: number;
    name: string;
    discount: number;
    discountType?: "%" | "$";
    display: "Both" | "Booking" | "Quote";
    isDefault?: boolean;
    description?: string;
    differentOnCustomerEnd?: boolean;
    showExplanation?: boolean;
    enablePopup?: boolean;
    occurrenceTime?: string;
  };
  const storageKey = useMemo(() => `frequencies_${industry}`, [industry]);
  const [rows, setRows] = useState<Row[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    differentOnCustomerEnd: false,
    showExplanation: false,
    enablePopup: false,
    display: "Both" as Row["display"],
    occurrenceTime: "",
    discount: "0",
    discountType: "%" as Row["discountType"],
    isDefault: false,
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(stored)) setRows(stored);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (editId && rows.length > 0) {
      const existing = rows.find(r => r.id === editId);
      if (existing) {
        setForm({
          name: existing.name,
          description: existing.description || "",
          differentOnCustomerEnd: !!existing.differentOnCustomerEnd,
          showExplanation: !!existing.showExplanation,
          enablePopup: !!existing.enablePopup,
          display: existing.display,
          occurrenceTime: existing.occurrenceTime || "",
          discount: String(existing.discount ?? 0),
          discountType: existing.discountType || "%",
          isDefault: !!existing.isDefault,
        });
      }
    }
  }, [editId, rows]);

  const save = () => {
    const discount = Number(form.discount) || 0;
    if (!form.name.trim()) return;

    if (editId) {
      const updated = rows.map(r => r.id === editId ? {
        ...r,
        name: form.name.trim(),
        discount,
        discountType: form.discountType,
        display: form.display,
        isDefault: form.isDefault,
        description: form.description,
        differentOnCustomerEnd: form.differentOnCustomerEnd,
        showExplanation: form.showExplanation,
        enablePopup: form.enablePopup,
        occurrenceTime: form.occurrenceTime,
      } : r);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } else {
      const nextId = (rows.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      const newRow: Row = {
        id: nextId,
        name: form.name.trim(),
        discount,
        discountType: form.discountType,
        display: form.display,
        isDefault: form.isDefault,
        description: form.description,
        differentOnCustomerEnd: form.differentOnCustomerEnd,
        showExplanation: form.showExplanation,
        enablePopup: form.enablePopup,
        occurrenceTime: form.occurrenceTime,
      };
      localStorage.setItem(storageKey, JSON.stringify([...rows, newRow]));
    }

    if (form.isDefault) {
      try {
        const arr: Row[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const normalized = arr.map(r => ({ ...r, isDefault: editId ? r.id === editId : r.id === Math.max(...arr.map(a => a.id)) }));
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      } catch {}
    }

    router.push(`/admin/settings/industries/form-1/frequencies?industry=${encodeURIComponent(industry)}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editId ? "Edit Frequency" : "Add Frequency"}</CardTitle>
          <CardDescription>Configure a frequency option for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="freq-name">Name</Label>
                <Input id="freq-name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex. Weekly" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="diff-customer" checked={form.differentOnCustomerEnd} onCheckedChange={(v) => setForm(p => ({ ...p, differentOnCustomerEnd: !!v }))} />
                <Label htmlFor="diff-customer" className="text-sm">Different on customer end</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="freq-desc">Description</Label>
                <Textarea id="freq-desc" rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add Description" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.showExplanation} onCheckedChange={(v) => setForm(p => ({ ...p, showExplanation: !!v }))} />
                  Show explanation icon on form
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.enablePopup} onCheckedChange={(v) => setForm(p => ({ ...p, enablePopup: !!v }))} />
                  Enable popup on selection
                </label>
              </div>
              <div className="space-y-2">
                <Label>Display</Label>
                <RadioGroup
                  value={form.display}
                  onValueChange={(v: Row["display"]) => setForm(p => ({ ...p, display: v }))}
                  className="grid gap-2"
                >
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Both" /> Customer frontend, backend & admin</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Booking" /> Customer backend & admin</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Quote" /> Admin only</label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Set occurrence time</Label>
                <Select value={form.occurrenceTime} onValueChange={(v) => setForm(p => ({ ...p, occurrenceTime: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every other week</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="freq-discount">Discount</Label>
                  <Input id="freq-discount" type="number" value={form.discount} onChange={(e) => setForm(p => ({ ...p, discount: e.target.value }))} />
                </div>
                <div>
                  <Select value={form.discountType} onValueChange={(v: Row["discountType"]) => setForm(p => ({ ...p, discountType: v }))}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="$">$</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="default" checked={form.isDefault} onCheckedChange={(v) => setForm(p => ({ ...p, isDefault: !!v }))} />
                <Label htmlFor="default" className="text-sm">Default</Label>
              </div>
            </TabsContent>
            <TabsContent value="dependencies" className="mt-4 text-sm text-muted-foreground">
              No dependencies configured. (Placeholder)
            </TabsContent>
            <TabsContent value="providers" className="mt-4 text-sm text-muted-foreground">
              No provider overrides configured. (Placeholder)
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => router.push(`/admin/settings/industries/form-1/frequencies?industry=${encodeURIComponent(industry)}`)}>Cancel</Button>
            <Button onClick={save} className="text-white" style={{ background: "linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)" }}>{editId ? "Save" : "Create"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
