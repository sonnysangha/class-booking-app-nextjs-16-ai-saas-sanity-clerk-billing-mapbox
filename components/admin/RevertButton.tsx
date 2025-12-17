"use client";

import { Suspense, useState } from "react";
import {
  useApplyDocumentActions,
  useDocument,
  discardDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { Check, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RevertButtonProps extends DocumentHandle {
  size?: "default" | "sm" | "lg" | "icon";
}

function RevertButtonContent({ size = "icon", ...handle }: RevertButtonProps) {
  const [isReverting, setIsReverting] = useState(false);
  const [justReverted, setJustReverted] = useState(false);
  const apply = useApplyDocumentActions();

  const { data: document } = useDocument(handle);

  const isDraft = document?._id?.startsWith("drafts.");

  const handleRevert = async () => {
    setIsReverting(true);
    try {
      const baseId = handle.documentId.replace("drafts.", "");
      await apply(
        discardDocument({
          documentId: baseId,
          documentType: handle.documentType,
        }),
      );
      setJustReverted(true);
      setTimeout(() => setJustReverted(false), 2000);
    } catch (error) {
      console.error("Failed to revert:", error);
    } finally {
      setIsReverting(false);
    }
  };

  if (!isDraft && !justReverted) {
    return null;
  }

  if (justReverted) {
    return (
      <Button variant="outline" size={size} disabled>
        <Check className="h-4 w-4 text-green-500" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size={size}
            onClick={handleRevert}
            disabled={isReverting}
          >
            {isReverting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Discard changes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RevertButton(props: RevertButtonProps) {
  return (
    <Suspense fallback={null}>
      <RevertButtonContent {...props} />
    </Suspense>
  );
}
