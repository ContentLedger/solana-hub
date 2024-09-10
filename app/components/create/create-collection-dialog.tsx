import {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useCreateCollectionQuery } from "@/hooks/useCreateCollectionQuery";
import { Progress } from "../ui/progress";
import { useEffect } from "react";

export type CreateCollectionDialogProps = {
  open?: boolean;
  onCompleted?: () => void;
  collection: Array<{
    name: string;
    description: string;
    image: string;
  }>;
};

function CreateCollectionContent({
  collection,
  onCompleted,
}: Pick<CreateCollectionDialogProps, "collection" | "onCompleted">) {
  const { progress, isSuccess, isError } = useCreateCollectionQuery(collection);
  useEffect(() => {
    if (isSuccess) {
      onCompleted?.();
    }
  }, [isSuccess, onCompleted]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Creating Collection</DialogTitle>
      </DialogHeader>
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Label className="sr-only">Progress</Label>
          <Progress
            value={(progress / collection.length) * 100}
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
