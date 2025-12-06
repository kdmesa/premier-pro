"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";

type PricingRow = {
  id: number;
  name: string;
  price: number;
  time: string;
  display: "Both" | "Booking" | "Quote";
  serviceCategory: string;
  frequency: string;
};

export default function IndustryFormPricingParameterPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";

  const storageKey = useMemo(() => `pricingParams_${industry}`, [industry]);
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [editingRow, setEditingRow] = useState<PricingRow | null>(null);
  const [draft, setDraft] = useState<PricingRow | null>(null);

  const sampleRows: PricingRow[] = [
    {
      id: 21,
      name: "1 - 1249 Sq Ft",
      price: 149,
      time: "2 Hr",
      display: "Both",
      serviceCategory: "Basic Cleaning, Hourly Deep Clean, Move In/Out Clean, Construction Clean Up, Deep Clean",
      frequency: "2x Per Week, Weekly, Every Other Week, Monthly",
    },
    {
      id: 46,
      name: "1250 - 1499 Sq Ft",
      price: 179,
      time: "2 Hr 30 Min",
      display: "Both",
      serviceCategory: "Basic Cleaning, Hourly Deep Clean, Move In/Out Clean, Construction Clean Up, Deep Clean",
      frequency: "2x Per Week, One-Time, Weekly, Every Other Week, Monthly",
    },
    {
      id: 47,
      name: "1500 - 1799 Sq Ft",
      price: 249,
      time: "3 Hr 30 Min",
      display: "Both",
      serviceCategory: "Basic Cleaning, Hourly Deep Clean, Move In/Out Clean, Construction Clean Up, Deep Clean",
      frequency: "2x Per Week, Weekly, Every Other Week, Monthly",
    },
    {
      id: 48,
      name: "1800 - 2099 Sq Ft",
      price: 299,
      time: "4 Hr",
      display: "Both",
      serviceCategory: "Basic Cleaning, Hourly Deep Clean, Move In/Out Clean, Construction Clean Up, Deep Clean",
      frequency: "2x Per Week, Weekly, Every Other Week, Monthly",
    },
    {
      id: 49,
      name: "2100 - 2399 Sq Ft",
      price: 379,
      time: "4 Hr 30 Min",
      display: "Both",
      serviceCategory: "Basic Cleaning, Hourly Deep Clean, Move In/Out Clean, Construction Clean Up, Deep Clean",
      frequency: "2x Per Week, Weekly, Every Other Week, Monthly",
    },
  ];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(stored) && stored.length > 0) setRows(stored);
      else setRows(sampleRows);
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, storageKey]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        try {
          const arr = JSON.parse(e.newValue || "[]");
          if (Array.isArray(arr)) setRows(arr);
        } catch {}
      }
    };
    window.addEventListener("storage", handler);
    const interval = setInterval(() => {
      try {
        const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (Array.isArray(arr)) setRows(arr);
      } catch {}
    }, 800);
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(interval);
    };
  }, [storageKey]);

  const remove = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  const move = (id: number, dir: -1 | 1) =>
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(j, 0, item);
      return copy;
    });

  const addNew = () => {
    setRows((prev) => {
      const maxId = prev.reduce((max, r) => (r.id > max ? r.id : max), 0);
      const next: PricingRow = {
        id: maxId + 1,
        name: "New Sq Ft Tier",
        price: 0,
        time: "",
        display: "Both",
        serviceCategory: "",
        frequency: "",
      };
      return [...prev, next];
    });
  };

  const updateRow = (id: number, patch: Partial<PricingRow>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updatePriority = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
      const genericKey = "pricingParams_Industry";
      localStorage.setItem(genericKey, JSON.stringify(rows));
      const homeCleaningKey = "pricingParams_Home Cleaning";
      localStorage.setItem(homeCleaningKey, JSON.stringify(rows));
    } catch {}
  };

  return (
    <Dialog open={!!editingRow} onOpenChange={(open) => {
      if (!open) {
        setEditingRow(null);
        setDraft(null);
      }
    }}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            {rows.length === 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  setRows(sampleRows);
                  localStorage.setItem(storageKey, JSON.stringify(sampleRows));
                }}
              >
                Load Sample Data
              </Button>
            )}
            <Button variant="outline" onClick={addNew}>
              Add New
            </Button>
            <Button variant="default" onClick={updatePriority}>
              Update priority
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Parameter - Sq Ft</CardTitle>
            <CardDescription>
              Define pricing tiers based on square footage for {industry}. Rows are stored per industry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Display</TableHead>
                    <TableHead>Service Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                        No data. Click Load Sample Data or Add New.
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>${r.price.toFixed(2)}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell>{r.display}</TableCell>
                      <TableCell>{r.serviceCategory}</TableCell>
                      <TableCell>{r.frequency}</TableCell>
                      <TableCell>{r.id}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                              Options <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRow(r);
                                setDraft(r);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(r.id, -1)}>Move Up</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(r.id, 1)}>Move Down</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => remove(r.id)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {editingRow && draft && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit pricing tier (ID {editingRow.id})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Price</label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value || 0) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Time</label>
              <Input
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Display</label>
              <Select
                value={draft.display}
                onValueChange={(value) =>
                  setDraft({ ...draft, display: value as PricingRow["display"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Both">Both</SelectItem>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Quote">Quote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Service Category</label>
              <Input
                value={draft.serviceCategory}
                onChange={(e) => setDraft({ ...draft, serviceCategory: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Frequency</label>
              <Input
                value={draft.frequency}
                onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingRow(null);
                  setDraft(null);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  updateRow(editingRow.id, draft);
                  setEditingRow(null);
                  setDraft(null);
                }}
              >
                Save
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
