"use client";

import {
  useDocument,
  useEditDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ActivitySessions } from "../ActivitySessions";
import { TIER_OPTIONS } from "@/lib/constants/subscription";
import { getStudioUrl } from "@/lib/utils/studioUrl";

/**
 * Extract plain text from Portable Text blocks for display
 */
function extractPlainText(blocks: unknown): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .filter((block: unknown) => {
      const b = block as { _type?: string };
      return b._type === "block";
    })
    .map((block: unknown) => {
      const b = block as { children?: Array<{ text?: string }> };
      return (b.children || []).map((child) => child.text || "").join("");
    })
    .join("\n\n");
}

interface ActivityDetailsProps {
  documentId: string;
}

export function ActivityDetails({ documentId }: ActivityDetailsProps) {
  const handle: DocumentHandle = { documentType: "activity", documentId };

  const { data: name } = useDocument({ ...handle, path: "name" });
  const { data: instructor } = useDocument({ ...handle, path: "instructor" });
  const { data: duration } = useDocument({ ...handle, path: "duration" });
  const { data: tierLevel } = useDocument({ ...handle, path: "tierLevel" });
  const { data: description } = useDocument({ ...handle, path: "description" });

  const editName = useEditDocument({ ...handle, path: "name" });
  const editInstructor = useEditDocument({ ...handle, path: "instructor" });
  const editDuration = useEditDocument({ ...handle, path: "duration" });
  const editTierLevel = useEditDocument({ ...handle, path: "tierLevel" });

  const plainTextDescription = extractPlainText(description);
  const studioUrl = getStudioUrl("activity", documentId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={(name as string) ?? ""}
              onChange={(e) => editName(e.target.value)}
              placeholder="Activity name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              value={(instructor as string) ?? ""}
              onChange={(e) => editInstructor(e.target.value)}
              placeholder="Instructor name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={(duration as number) ?? 60}
                onChange={(e) => editDuration(Number(e.target.value))}
                min={15}
                max={180}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierLevel">Tier Level</Label>
              <Select
                value={(tierLevel as string) ?? "basic"}
                onValueChange={(value) => editTierLevel(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {TIER_OPTIONS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <a
                href={studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Edit in Studio
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {plainTextDescription ? (
              <div className="whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                {plainTextDescription}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed p-3 text-center text-sm text-muted-foreground">
                No description yet.{" "}
                <a
                  href={studioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Add one in Studio
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images Card */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader {...handle} />
        </CardContent>
      </Card>

      {/* Sessions Card - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivitySessions activityId={documentId.replace("drafts.", "")} />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteButton
            handle={handle}
            redirectTo="/admin/activities"
            referenceQuery={`*[_type == "classSession" && references($id)]{ _id }`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
