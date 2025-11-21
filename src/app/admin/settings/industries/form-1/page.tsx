"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IndustryForm1Page() {
  const params = useSearchParams();
  const industry = params.get("industry") || "Industry";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{industry} - Form 1</CardTitle>
          <CardDescription>Configure the primary form for this industry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">This is a placeholder. Add fields and logic specific to {industry} here.</p>
          <div className="flex gap-2">
            <Button variant="default">Save</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
