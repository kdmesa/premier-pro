"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type PricingRow = {
  id: number;
  name: string;
  price: number;
  time: string;
  display: "Customer Frontend, Backend & Admin" | "Customer Backend & Admin" | "Admin Only";
  serviceCategory: string;
  frequency: string;
  variableCategory: string;
  description: string;
  isDefault: boolean;
  showBasedOnFrequency: boolean;
  showBasedOnServiceCategory: boolean;
  excludedExtras: number[];
  excludedServices: number[];
};

type PricingVariable = {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
};

export default function IndustryFormPricingParameterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const industry = params.get("industry") || "Industry";

  const [allRows, setAllRows] = useState<Record<string, PricingRow[]>>({});
  const [variables, setVariables] = useState<PricingVariable[]>([]);

  const defaultVariables: PricingVariable[] = [
    { id: "sq-ft", name: "Sq Ft", category: "Sq Ft", description: "Square footage tiers", isActive: true },
    { id: "bedroom", name: "Bedroom", category: "Bedroom", description: "Number of bedrooms", isActive: false },
    { id: "bathroom", name: "Bathroom", category: "Bathroom", description: "Number of bathrooms", isActive: false },
  ];

  useEffect(() => {
    try {
      const variablesKey = `pricingVariables_${industry}`;
      const storedVars = JSON.parse(localStorage.getItem(variablesKey) || "null");
      if (Array.isArray(storedVars) && storedVars.length > 0) {
        setVariables(storedVars);
      } else {
        // Initialize with default variables if none exist
        setVariables(defaultVariables);
        localStorage.setItem(variablesKey, JSON.stringify(defaultVariables));
      }
    } catch (e) {
      console.error("Error loading variables:", e);
      setVariables(defaultVariables);
    }

    try {
      const allDataKey = `pricingParamsAll_${industry}`;
      const storedData = JSON.parse(localStorage.getItem(allDataKey) || "null");
      if (storedData && typeof storedData === "object") {
        setAllRows(storedData);
      }
    } catch (e) {
      console.error("Error loading pricing data:", e);
    }
  }, [industry]);

  useEffect(() => {
    if (Object.keys(allRows).length > 0) {
      const allDataKey = `pricingParamsAll_${industry}`;
      localStorage.setItem(allDataKey, JSON.stringify(allRows));
    }
  }, [allRows, industry]);

  // Keep table in sync if localStorage changes
  useEffect(() => {
    const allDataKey = `pricingParamsAll_${industry}`;
    const interval = setInterval(() => {
      try {
        const storedData = JSON.parse(localStorage.getItem(allDataKey) || "{}");
        if (storedData && typeof storedData === "object") {
          setAllRows(storedData);
        }
      } catch {}
    }, 800);
    return () => clearInterval(interval);
  }, [industry]);

  const getAllRows = (): PricingRow[] => {
    const allRowsArray: PricingRow[] = [];
    variables.forEach((variable) => {
      const rows = allRows[variable.category] || [];
      allRowsArray.push(...rows);
    });
    return allRowsArray;
  };

  const remove = (variableCategory: string, id: number) => {
    setAllRows((prev) => ({
      ...prev,
      [variableCategory]: (prev[variableCategory] || []).filter((r) => r.id !== id),
    }));
  };

  const move = (variableCategory: string, id: number, dir: -1 | 1) => {
    setAllRows((prev) => {
      const rows = prev[variableCategory] || [];
      const idx = rows.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= rows.length) return prev;
      const copy = [...rows];
      const [item] = copy.splice(idx, 1);
      copy.splice(j, 0, item);
      return {
        ...prev,
        [variableCategory]: copy,
      };
    });
  };

  const updatePriority = () => {
    try {
      const allDataKey = `pricingParamsAll_${industry}`;
      localStorage.setItem(allDataKey, JSON.stringify(allRows));
    } catch (e) {
      console.error("Error saving priority:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/settings/industries/form-1/pricing-parameter/new?industry=${encodeURIComponent(industry)}`)}
          >
            Add New
          </Button>
          <Button variant="default" onClick={updatePriority}>
            Update priority
          </Button>
          <Button
            variant="default"
            onClick={() =>
              router.push(
                `/admin/settings/industries/form-1/pricing-parameter/manage-variables?industry=${encodeURIComponent(
                  industry
                )}`
              )
            }
          >
            Manage variable
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Pricing Parameter</CardTitle>
          <CardDescription>Manage pricing parameters for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Display</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllRows().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      No data. Click Add New or Manage variable.
                    </TableCell>
                  </TableRow>
                )}
                {variables.map((variable) => {
                  const rows = allRows[variable.category] || [];
                  return rows.map((r) => (
                    <TableRow key={`${variable.category}-${r.id}`}>
                      <TableCell className="font-medium">{variable.name}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>${r.price.toFixed(2)}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell className="text-xs">{r.display}</TableCell>
                      <TableCell>{r.isDefault ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                              Options <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/settings/industries/form-1/pricing-parameter/new?industry=${encodeURIComponent(industry)}&editId=${r.id}&category=${encodeURIComponent(variable.category)}`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(variable.category, r.id, -1)}>
                              Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => move(variable.category, r.id, 1)}>
                              Move Down
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => remove(variable.category, r.id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
