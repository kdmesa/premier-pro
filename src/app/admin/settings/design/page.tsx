"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Layout, Palette, Save } from "lucide-react";

export default function DesignFormsWebsitePage() {
  const { toast } = useToast();
  
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#00BCD4",
    secondaryColor: "#00D4E8",
    companyLogo: "",
    websiteTheme: "modern",
    formStyle: "card"
  });

  const handleSaveDesignSettings = () => {
    toast({
      title: "Design Settings Saved",
      description: "Design and website settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Design Forms & Website */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <CardTitle>Design Forms & Website</CardTitle>
          </div>
          <CardDescription>
            Customize the appearance of your forms and website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={designSettings.primaryColor}
                  onChange={(e) => setDesignSettings({...designSettings, primaryColor: e.target.value})}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={designSettings.primaryColor}
                  onChange={(e) => setDesignSettings({...designSettings, primaryColor: e.target.value})}
                  placeholder="#00BCD4"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={designSettings.secondaryColor}
                  onChange={(e) => setDesignSettings({...designSettings, secondaryColor: e.target.value})}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={designSettings.secondaryColor}
                  onChange={(e) => setDesignSettings({...designSettings, secondaryColor: e.target.value})}
                  placeholder="#00D4E8"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website-theme">Website Theme</Label>
              <select
                id="website-theme"
                value={designSettings.websiteTheme}
                onChange={(e) => setDesignSettings({...designSettings, websiteTheme: e.target.value})}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-style">Form Style</Label>
              <select
                id="form-style"
                value={designSettings.formStyle}
                onChange={(e) => setDesignSettings({...designSettings, formStyle: e.target.value})}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="card">Card Style</option>
                <option value="inline">Inline Style</option>
                <option value="modal">Modal Style</option>
                <option value="sidebar">Sidebar Style</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="company-logo">Company Logo URL</Label>
            <Input
              id="company-logo"
              placeholder="https://example.com/logo.png"
              value={designSettings.companyLogo}
              onChange={(e) => setDesignSettings({...designSettings, companyLogo: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">
              Upload your logo to a hosting service and paste the URL here
            </p>
          </div>

          <Button onClick={handleSaveDesignSettings} className="mt-4" style={{ background: 'linear-gradient(135deg, #00BCD4 0%, #00D4E8 100%)', color: 'white' }}>
            <Palette className="h-4 w-4 mr-2" />
            Save Design Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
