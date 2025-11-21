"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryFormPricingParameterPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Pricing Parameter</CardTitle>
          <CardDescription>Define variables that affect pricing for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder page. Add your pricing parameters UI here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
