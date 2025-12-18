"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type LocationRow = {
  id: number;
  name: string;
  city?: string;
  state?: string;
  postalCode?: string;
  active: boolean;
};

export default function IndustryFormLocationsPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";

  const storageKey = useMemo(() => `locations_${industry}`, [industry]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [newLocation, setNewLocation] = useState({
    name: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(stored)) {
        setLocations(stored);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(locations));
  }, [locations, storageKey]);

  const handleAdd = () => {
    if (!newLocation.name.trim()) return;
    const row: LocationRow = {
      id: Date.now(),
      name: newLocation.name.trim(),
      city: newLocation.city.trim() || undefined,
      state: newLocation.state.trim() || undefined,
      postalCode: newLocation.postalCode.trim() || undefined,
      active: true,
    };
    setLocations((prev) => [row, ...prev]);
    setNewLocation({ name: "", city: "", state: "", postalCode: "" });
  };

  const toggleActive = (id: number) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, active: !loc.active } : loc))
    );
  };

  const remove = (id: number) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const move = (id: number, dir: -1 | 1) => {
    setLocations((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(j, 0, item);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Locations</CardTitle>
          <CardDescription>
            Configure the service areas used to validate bookings for {industry}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inline create form */}
          <div className="grid gap-3 md:grid-cols-[2fr_1.5fr_0.8fr_1fr_auto]">
            <Input
              placeholder="Area name (e.g. Downtown Chicago)"
              value={newLocation.name}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="City"
              value={newLocation.city}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, city: e.target.value }))}
            />
            <Input
              placeholder="State"
              value={newLocation.state}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, state: e.target.value }))}
            />
            <Input
              placeholder="ZIP / Postal code"
              value={newLocation.postalCode}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, postalCode: e.target.value }))}
            />
            <Button onClick={handleAdd} className="whitespace-nowrap">
              Add location
            </Button>
          </div>

          {/* Locations table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Postal code</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                      No locations configured yet. Add the first one above.
                    </TableCell>
                  </TableRow>
                )}
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>{loc.city || "-"}</TableCell>
                    <TableCell>{loc.state || "-"}</TableCell>
                    <TableCell>{loc.postalCode || "-"}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={loc.active}
                        onCheckedChange={() => toggleActive(loc.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                            Options <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => move(loc.id, -1)}>
                            Move up
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => move(loc.id, 1)}>
                            Move down
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => remove(loc.id)}
                            className="text-red-600"
                          >
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
  );
}
