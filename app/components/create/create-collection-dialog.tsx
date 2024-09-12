import {
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import { Label } from "../ui/label";
import { useCreateCollectionQuery } from "@/hooks/useCreateCollectionQuery";
import { Progress } from "../ui/progress";
import { useCallback } from "react";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";
import { registerCollection } from "@/lib/solanaHubProgram";

export type CreateCollectionDialogProps = {
  submit?: boolean;
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
  const provider = useAnchorProvider();
  const { progress, isSuccess, isError, queries } = useCreateCollectionQuery(
    collection.id,
    collection.items
  );

  const handlePublish = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const collectionName = `collection-${collection.id}`;
      const secondsToClose = 360;
      const nftList = queries.map((query, index) => ({
        uri: query.data?.metadataUrl ?? "",
        name: `${collectionName} #${index}`,
        symbol: "solana_hub",
      }));

      registerCollection(
        collectionName,
        secondsToClose,
        nftList,
        provider
      ).then((value: string) => {
        console.log("Transaction sent", value);
        onCompleted?.(
          collection.id,
          queries.map(
            (query) => query?.data ?? { metadataUrl: "", imageUrl: "" }
          )
        );
      });
    },
    [collection.id, onCompleted, queries]
  );

  return (
    <AlertDialogContent className="sm:max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle>Creating Collection</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogDescription>
        {queries.length} items in collection
        {isSuccess ? " - Ready to publish" : isError ? " - Failed" : ""}
      </AlertDialogDescription>
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Label className="sr-only">Progress</Label>
          <Progress
            value={(progress / collection.items.length) * 100}
            className="w-full"
          />
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handlePublish} disabled={!isSuccess}>
          Publish
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function CreateCollectionDialog({
  collection,
  submit,
  onCompleted,
}: CreateCollectionDialogProps) {
  return submit ? (
    <CreateCollectionContent
      collection={collection}
      onCompleted={onCompleted}
    />
  ) : null;
}
