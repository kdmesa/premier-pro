"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServiceCategoryNewPage() {
  const params = useSearchParams();
  const router = useRouter();
  const industry = params.get("industry") || "Industry";
  const editId = params.get("editId") ? Number(params.get("editId")) : null;

  type ServiceCategory = {
    id: number;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    excludedProviders?: string[];
  };
  
  const storageKey = useMemo(() => `service_categories_${industry}`, [industry]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    excludedProviders: [] as string[],
  });

  // Fetch providers from localStorage
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (Array.isArray(stored)) setCategories(stored);
    } catch {}
  }, [storageKey]);

  // Load providers from localStorage
  useEffect(() => {
    try {
      const storedProviders = JSON.parse(localStorage.getItem("adminProviders") || "[]");
      if (Array.isArray(storedProviders)) {
        setProviders(storedProviders.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (editId && categories.length > 0) {
      const existing = categories.find(c => c.id === editId);
      if (existing) {
        setForm({
          name: existing.name,
          description: existing.description || "",
          excludedProviders: existing.excludedProviders || [],
        });
      }
    }
  }, [editId, categories]);

  const save = () => {
    if (!form.name.trim()) return;

    if (editId) {
      const updated = categories.map(c => c.id === editId ? {
        ...c,
        name: form.name.trim(),
        description: form.description,
        excludedProviders: form.excludedProviders,
      } : c);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } else {
      const nextId = (categories.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;
      const newCategory: ServiceCategory = {
        id: nextId,
        name: form.name.trim(),
        description: form.description,
        excludedProviders: form.excludedProviders,
      };
      localStorage.setItem(storageKey, JSON.stringify([...categories, newCategory]));
    }

    router.push(`/admin/settings/industries/form-1/service-category?industry=${encodeURIComponent(industry)}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editId ? "Edit Service Category" : "Add Service Category"}</CardTitle>
          <CardDescription>Configure a service category for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
            </TabsList>

            {/* DETAILS TAB */}
            <TabsContent value="details" className="mt-4 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category-name">Name *</Label>
                <Input 
                  id="category-name" 
                  value={form.name} 
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder="Ex. Kitchen, Bathroom, etc." 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-desc">Description</Label>
                <Textarea 
                  id="category-desc" 
                  rows={3} 
                  value={form.description} 
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} 
                  placeholder="Add a brief description of this category" 
                />
              </div>
            </TabsContent>

            {/* DEPENDENCIES TAB */}
            <TabsContent value="dependencies" className="mt-4 text-sm text-muted-foreground">
              No dependencies configured. (Placeholder)
            </TabsContent>

            {/* PROVIDERS TAB */}
            <TabsContent value="providers" className="mt-4 space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Check the providers you want to exclude from this service category.
                </p>
                
                {providers.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No providers added yet. Add providers from the Providers section in the admin dashboard.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <Label>Providers</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all-providers"
                          checked={form.excludedProviders.length === providers.length && providers.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setForm(p => ({ ...p, excludedProviders: providers.map(pr => pr.id) }));
                            } else {
                              setForm(p => ({ ...p, excludedProviders: [] }));
                            }
                          }}
                        />
                        <Label htmlFor="select-all-providers" className="text-sm font-medium cursor-pointer">Select All</Label>
                      </div>
                      {providers.map((provider) => (
                        <div key={provider.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`provider-${provider.id}`}
                            checked={form.excludedProviders.includes(provider.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setForm(p => ({ ...p, excludedProviders: [...p.excludedProviders, provider.id] }));
                              } else {
                                setForm(p => ({ ...p, excludedProviders: p.excludedProviders.filter(c => c !== provider.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`provider-${provider.id}`} className="text-sm font-normal cursor-pointer">{provider.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/settings/industries/form-1/service-category?industry=${encodeURIComponent(industry)}`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={save} 
              className="text-white" 
              style={{ background: "linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)" }}
              disabled={!form.name.trim()}
            >
              {editId ? "Save" : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
