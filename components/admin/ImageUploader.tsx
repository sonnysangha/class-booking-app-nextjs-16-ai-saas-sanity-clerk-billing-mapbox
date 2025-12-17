"use client";

import { useState, useRef, Suspense } from "react";
import Image from "next/image";
import {
  useDocument,
  useEditDocument,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { useSanityClient } from "@/lib/hooks/useSanityClient";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Activity } from "@/sanity.types";

type ImageArray = NonNullable<Activity["images"]>;
type ImageItem = ImageArray[number];

function ImageUploaderContent(handle: DocumentHandle) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const client = useSanityClient();
  const { data: images } = useDocument({ ...handle, path: "images" });
  const editImages = useEditDocument({ ...handle, path: "images" });

  const currentImages = (images as ImageArray | null) ?? [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Uploading ${files.length} image(s)...`);

    try {
      const newImages: ImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

        const asset = await client.assets.upload("image", file, {
          filename: file.name,
        });

        newImages.push({
          _type: "image",
          _key: crypto.randomUUID(),
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        });
      }

      const updatedImages = [...currentImages, ...newImages];
      editImages(updatedImages);

      setUploadProgress(null);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadProgress("Upload failed. Please try again.");
      setTimeout(() => setUploadProgress(null), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (keyToRemove: string) => {
    const updatedImages = currentImages.filter(
      (img) => img._key !== keyToRemove,
    );
    editImages(updatedImages.length > 0 ? updatedImages : null);
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentImages.length) return;

    const updatedImages = [...currentImages];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    editImages(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </>
          )}
        </Button>
      </div>

      {currentImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {currentImages.map((image, index) => (
            <ImageThumbnail
              key={image._key}
              image={image}
              index={index}
              isFirst={index === 0}
              onRemove={() => handleRemoveImage(image._key)}
              onMoveUp={() => handleMoveImage(index, index - 1)}
              onMoveDown={() => handleMoveImage(index, index + 1)}
              canMoveUp={index > 0}
              canMoveDown={index < currentImages.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted py-8">
          <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No images uploaded</p>
          <p className="text-xs text-muted-foreground/70">
            Click upload to add images
          </p>
        </div>
      )}

      {currentImages.length > 0 && (
        <p className="text-xs text-muted-foreground">
          First image is the main image.
        </p>
      )}
    </div>
  );
}

interface ImageThumbnailProps {
  image: ImageItem;
  index: number;
  isFirst: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function ImageThumbnail({
  image,
  isFirst,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ImageThumbnailProps) {
  const assetRef = image.asset?._ref;
  let imageUrl: string | null = null;

  if (assetRef) {
    const match = assetRef.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-(\w+)$/);
    if (match) {
      const [, id, dimensions, format] = match;
      imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${format}`;
    }
  }

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg bg-muted",
        isFirst && "ring-2 ring-primary ring-offset-2",
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="Uploaded image"
          fill
          className="object-cover"
          sizes="150px"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      {isFirst && (
        <div className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
          Main
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ImageUploaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="aspect-square rounded-lg" />
        <Skeleton className="aspect-square rounded-lg" />
      </div>
    </div>
  );
}

export function ImageUploader(props: DocumentHandle) {
  return (
    <Suspense fallback={<ImageUploaderSkeleton />}>
      <ImageUploaderContent {...props} />
    </Suspense>
  );
}
