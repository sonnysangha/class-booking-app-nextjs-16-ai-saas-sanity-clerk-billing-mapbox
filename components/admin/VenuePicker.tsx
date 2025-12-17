"use client";

import { Suspense } from "react";
import {
  useDocumentProjection,
  useDocuments,
  type DocumentHandle,
} from "@sanity/sdk-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VenueNameProjection {
  name?: string;
}

function VenuePickerItem({ handle }: { handle: DocumentHandle }) {
  const { data } = useDocumentProjection({
    ...handle,
    projection: `{ name }`,
  });

  const baseId = handle.documentId.replace("drafts.", "");
  const item = data as VenueNameProjection | null;

  return <SelectItem value={baseId}>{item?.name || "Untitled"}</SelectItem>;
}

interface VenuePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function VenuePicker({ value, onChange }: VenuePickerProps) {
  const { data: venues } = useDocuments({ documentType: "venue" });

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a venue" />
      </SelectTrigger>
      <SelectContent>
        {venues?.map((doc) => (
          <Suspense
            key={doc.documentId}
            fallback={
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Loading...
              </div>
            }
          >
            <VenuePickerItem handle={doc} />
          </Suspense>
        ))}
      </SelectContent>
    </Select>
  );
}

