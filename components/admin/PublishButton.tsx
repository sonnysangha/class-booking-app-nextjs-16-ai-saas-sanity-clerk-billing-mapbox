"use client";

import { Suspense, useState } from "react";
import {
  useApplyDocumentActions,
  useDocument,
  publishDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PublishButtonProps extends DocumentHandle {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

function PublishButtonContent({
  variant = "default",
  size = "default",
  ...handle
}: PublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const apply = useApplyDocumentActions();

  const { data: document } = useDocument(handle);

  const isDraft = document?._id?.startsWith("drafts.");

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const baseId = handle.documentId.replace("drafts.", "");
      await apply(
        publishDocument({
          documentId: baseId,
          documentType: handle.documentType,
        }),
      );
      setJustPublished(true);
      setTimeout(() => setJustPublished(false), 2000);
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isDraft && !justPublished) {
    return null;
  }

  if (justPublished) {
    return (
      <Button variant={variant} size={size} disabled className="min-w-[100px]">
        <Check className="mr-2 h-4 w-4 text-green-500" />
        Published
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePublish}
      disabled={isPublishing}
      className="min-w-[100px]"
    >
      {isPublishing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Publishing
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Publish
        </>
      )}
    </Button>
  );
}

function PublishButtonSkeleton() {
  return <Skeleton className="h-9 w-[100px]" />;
}

export function PublishButton(props: PublishButtonProps) {
  return (
    <Suspense fallback={<PublishButtonSkeleton />}>
      <PublishButtonContent {...props} />
    </Suspense>
  );
}
