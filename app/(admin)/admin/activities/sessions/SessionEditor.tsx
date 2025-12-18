"use client";

import { Suspense } from "react";
import {
  useDocument,
  useEditDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublishButton } from "@/components/admin/PublishButton";
import { RevertButton } from "@/components/admin/RevertButton";
import { VenuePicker } from "@/components/admin/VenuePicker";
import { SESSION_STATUS_OPTIONS } from "@/lib/constants/status";

interface SessionEditorProps {
  sessionId: string;
}

export function SessionEditor({ sessionId }: SessionEditorProps) {
  const handle: DocumentHandle = {
    documentType: "classSession",
    documentId: sessionId,
  };

  const { data: startTime } = useDocument({ ...handle, path: "startTime" });
  const { data: maxCapacity } = useDocument({ ...handle, path: "maxCapacity" });
  const { data: status } = useDocument({ ...handle, path: "status" });
  const { data: venue } = useDocument({ ...handle, path: "venue" });

  const editStartTime = useEditDocument({ ...handle, path: "startTime" });
  const editMaxCapacity = useEditDocument({ ...handle, path: "maxCapacity" });
  const editStatus = useEditDocument({ ...handle, path: "status" });
  const editVenue = useEditDocument({ ...handle, path: "venue" });

  // Extract venue ref
  const venueRef = venue as { _ref?: string } | undefined;
  const currentVenueId = venueRef?._ref || "";

  // Convert ISO to datetime-local format
  const dateTimeValue = startTime
    ? new Date(startTime as string).toISOString().slice(0, 16)
    : "";

  const handleVenueChange = (venueId: string) => {
    editVenue({
      _type: "reference",
      _ref: venueId,
    });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`startTime-${sessionId}`}>Date & Time</Label>
          <Input
            id={`startTime-${sessionId}`}
            type="datetime-local"
            value={dateTimeValue}
            onChange={(e) => {
              if (e.target.value) {
                editStartTime(new Date(e.target.value).toISOString());
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`capacity-${sessionId}`}>Capacity</Label>
          <Input
            id={`capacity-${sessionId}`}
            type="number"
            value={(maxCapacity as number) ?? 20}
            onChange={(e) => editMaxCapacity(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`status-${sessionId}`}>Status</Label>
          <Select
            value={(status as string) ?? "scheduled"}
            onValueChange={(value) => editStatus(value)}
          >
            <SelectTrigger id={`status-${sessionId}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Venue</Label>
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <VenuePicker value={currentVenueId} onChange={handleVenueChange} />
          </Suspense>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RevertButton {...handle} />
        <PublishButton {...handle} size="sm" />
      </div>
    </div>
  );
}

