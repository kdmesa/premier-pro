"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building2 } from "lucide-react";

export default function YourInfoPage() {
  const [logoFileName, setLogoFileName] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Please select a valid image file.");
      setLogoFileName("");
      setLogoPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width > 300 || img.height > 300) {
        setLogoError("Image must be at most 300x300 pixels.");
        URL.revokeObjectURL(url);
        setLogoFileName("");
        setLogoPreview("");
      } else {
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoFileName(file.name);
        setLogoPreview(url);
      }
    };
    img.onerror = () => {
      setLogoError("Could not load the selected image.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Your info</CardTitle>
          </div>
          <CardDescription>
            Here you can edit or update your profile details. You can also add a profile logo which will display in the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Logo selector row */}
          <div className="space-y-2">
            <Label htmlFor="logo">Choose File</Label>
            <div className="flex items-center gap-4 max-w-2xl">
              {/* Preview */}
              <div className="h-14 w-14 rounded-full border bg-white overflow-hidden flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-[10px] text-muted-foreground">No Logo</div>
                )}
              </div>

              {/* Filename + Browse */}
              <div className="flex-1 flex items-center gap-2">
                <Input readOnly value={logoFileName || "No file chosen"} className="bg-muted/40" />
                <input
                  ref={fileInputRef}
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} className="min-w-[110px]">
                  Browse
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Image size should not be more than 300px by 300px.</div>
            {logoError && <div className="text-xs text-red-600">{logoError}</div>}
          </div>

          {/* Details form */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" placeholder="First name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" placeholder="Last name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone no.</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Type address" />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="apt">Apt no.</Label>
              <Input id="apt" placeholder="Apt no." />
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 flex justify-end">
            <Button className="px-6" style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
