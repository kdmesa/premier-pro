"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryFormCustomSectionsPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Custom Sections</CardTitle>
          <CardDescription>Create custom form sections unique to {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder page. Add your custom sections UI here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
