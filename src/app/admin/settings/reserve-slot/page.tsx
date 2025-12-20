"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function ReserveSlotPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Reserve Slot</CardTitle>
          </div>
          <CardDescription>
            Manage reserved time slots and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p>Reserve slot settings content coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
