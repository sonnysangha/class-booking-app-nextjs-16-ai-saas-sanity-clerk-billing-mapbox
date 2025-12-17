"use client";

import Link from "next/link";
import { useDocumentProjection } from "@sanity/sdk-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublishButton } from "@/components/admin/PublishButton";
import { RevertButton } from "@/components/admin/RevertButton";
import { TIER_COLORS } from "@/lib/constants/subscription";

interface ActivityHeaderProjection {
  name?: string;
  tierLevel?: string;
  categoryName?: string;
}

interface ActivityHeaderProps {
  documentId: string;
}

export function ActivityHeader({ documentId }: ActivityHeaderProps) {
  const handle = { documentType: "activity" as const, documentId };
  const { data } = useDocumentProjection({
    ...handle,
    projection: `{ name, tierLevel, "categoryName": category->name }`,
  });

  const activity = data as ActivityHeaderProjection | null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/admin/activities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activity?.name || "Activity"}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            {activity?.tierLevel && (
              <Badge
                className={
                  TIER_COLORS[activity.tierLevel as keyof typeof TIER_COLORS] ||
                  ""
                }
              >
                {activity.tierLevel}
              </Badge>
            )}
            {activity?.categoryName && (
              <Badge variant="outline">{activity.categoryName}</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RevertButton {...handle} />
        <PublishButton {...handle} />
      </div>
    </div>
  );
}

