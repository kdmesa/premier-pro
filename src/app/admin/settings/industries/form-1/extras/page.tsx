"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryFormExtrasPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Extras</CardTitle>
          <CardDescription>Manage upsell extras and add-ons for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder page. Add your extras UI here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
