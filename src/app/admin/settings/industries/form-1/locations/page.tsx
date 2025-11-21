"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryFormLocationsPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Locations</CardTitle>
          <CardDescription>Configure available service locations for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder page. Add your locations UI here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
