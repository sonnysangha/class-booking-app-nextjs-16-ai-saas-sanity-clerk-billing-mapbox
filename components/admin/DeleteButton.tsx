"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useApplyDocumentActions,
  useDocument,
  useQuery,
  deleteDocument,
  discardDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStudioUrl } from "@/lib/utils/studioUrl";

interface DeleteButtonProps {
  handle: DocumentHandle;
  redirectTo?: string;
  referenceQuery?: string;
}

function DeleteButtonContent({
  handle,
  redirectTo = "/admin",
  referenceQuery,
}: DeleteButtonProps) {
  const router = useRouter();
  const apply = useApplyDocumentActions();

  const baseId = handle.documentId.replace("drafts.", "");

  const { data: doc } = useDocument(handle);

  const { data: publishedDoc } = useQuery<{ _id: string } | null>({
    query: `*[_id == $id][0]{ _id }`,
    params: { id: baseId },
    perspective: "published",
  });

  // Check for references if a query is provided
  const { data: referencingDocs } = useQuery<{ _id: string }[]>({
    query: referenceQuery ?? `*[references($id)][0...5]{ _id }`,
    params: { id: baseId },
  });

  const isDraft = doc?._id?.startsWith("drafts.");
  const hasPublishedVersion = !!publishedDoc;
  const hasReferences = referencingDocs && referencingDocs.length > 0;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this document permanently? This cannot be undone.",
    );
    if (!confirmed) return;

    try {
      if (hasPublishedVersion) {
        const result = await apply(
          deleteDocument({
            documentId: baseId,
            documentType: handle.documentType,
          }),
        );
        await result.submitted();
      } else if (isDraft) {
        const result = await apply(
          discardDocument({
            documentId: baseId,
            documentType: handle.documentType,
          }),
        );
        await result.submitted();
      }
      router.push(redirectTo);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (hasReferences) {
    const refCount = referencingDocs?.length ?? 0;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1.5" asChild>
              <Link
                href={getStudioUrl(handle.documentType, handle.documentId)}
                target="_blank"
              >
                <Trash2 className="h-4 w-4" />
                Delete in Studio
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Referenced by {refCount}+ document{refCount !== 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-1.5"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}

function DeleteButtonFallback() {
  return <Skeleton className="h-9 w-20" />;
}

export function DeleteButton(props: DeleteButtonProps) {
  return (
    <Suspense fallback={<DeleteButtonFallback />}>
      <DeleteButtonContent {...props} />
    </Suspense>
  );
}
