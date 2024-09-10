import {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useCreateCollectionQuery } from "@/hooks/useCreateCollectionQuery";
import { Progress } from "../ui/progress";
import { useEffect, useRef } from "react";

export type CreateCollectionDialogProps = {
  open?: boolean;
  onCompleted?: (key: string, results: CreateCollectionResults) => void;
  collection: {
    id: string;
    items: Array<{
      name: string;
      description: string;
      image: string;
    }>;
  };
};

export type CreateCollectionResults = {
  metadataUrl: string;
  imageUrl: string;
}[];

export function CreateCollectionContent({
  collection,
  onCompleted,
}: Pick<CreateCollectionDialogProps, "collection" | "onCompleted">) {
  const completed = useRef(new Set<string>());
  const { progress, isSuccess, isError, queries } = useCreateCollectionQuery(
    collection.id,
    collection.items
  );

  useEffect(() => {
    if (isSuccess && !completed.current.has(collection.id)) {
      const results = queries.map(
        (query) => query?.data ?? { metadataUrl: "", imageUrl: "" }
      );
      onCompleted?.(collection.id, results);
      completed.current.add(collection.id);
    }
  }, [collection.id, isSuccess, onCompleted, queries]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Creating Collection</DialogTitle>
      </DialogHeader>
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Label className="sr-only">Progress</Label>
          <Progress
            value={(progress / collection.items.length) * 100}
            className="w-full"
          />
        </div>
      </div>
      <DialogFooter className="sm:justify-start">
        {isError ? (
          <p className="text-red-500">Failed to create collection</p>
        ) : null}
      </DialogFooter>
    </DialogContent>
  );
}

export function CreateCollectionDialog({
  collection,
  open,
  onCompleted,
}: CreateCollectionDialogProps) {
  return open ? (
    <CreateCollectionContent
      collection={collection}
      onCompleted={onCompleted}
    />
  ) : null;
}
