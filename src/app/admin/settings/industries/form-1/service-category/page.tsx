"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryFormServiceCategoryPage() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1 / Service Category</CardTitle>
          <CardDescription>Organize categories used in the booking form.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder page. Add your categories UI here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
