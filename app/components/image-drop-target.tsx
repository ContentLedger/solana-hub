"use client";

import { cn } from "@/lib/utils";
import React, { useCallback, useState } from "react";

export type ImageDropTargetProps = React.PropsWithChildren<{
  src?: string;
  disabled?: boolean;
  onDrop?: (dataUrl: string, file: File) => void;
}>;

export function ImageDropTarget({
  src,
  disabled = false,
  children,
  onDrop,
}: ImageDropTargetProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer?.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onDrop?.(dataUrl, file);
      };
      reader.readAsDataURL(file as Blob);
    },
    [onDrop]
  );
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={disabled ? undefined : handleDragOver}
      onDragLeave={disabled ? undefined : handleDragLeave}
      onDragEnd={disabled ? undefined : handleDragLeave}
      className={cn(
        "flex items-center justify-center w-full h-full border-dashed rounded-md",
        isDragging ? "border-primary border-4" : "border-muted border-2",
        disabled ? "border-solid" : "cursor-pointer"
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Uploaded image"
          className="w-full h-full object-cover rounded-md p-1"
        />
      ) : (
        children
      )}
    </div>
  );
}
