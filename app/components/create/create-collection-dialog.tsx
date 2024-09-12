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
import { useCallback, useEffect, useState } from "react";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";
import { registerCollection } from "@/lib/solanaHubProgram";
import { pluralize } from "@/lib/utils";
import { UpdateIcon } from "@radix-ui/react-icons";

export type CreateCollectionDialogProps = {
  submit?: boolean;
  onCompleted?: (
    key: string,
    txHash: string,
    results: CreateCollectionResults
  ) => void;
  collection: {
    id: string;
    name: string;
    duration: number;
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
  const [pending, setPending] = useState(true);
  const provider = useAnchorProvider();
  const { progress, isSuccess, isError, queries } = useCreateCollectionQuery(
    collection.id,
    collection.items,
    provider.publicKey?.toBase58() ?? ""
  );

  useEffect(() => {
    if (isSuccess || isError) {
      setPending(false);
    }
  }, [isSuccess, isError]);

  const handlePublish = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const collectionName = collection.name;
      const secondsToClose = collection.duration;
      const nftList = queries.map((query, index) => ({
        uri: query.data?.metadataUrl ?? "",
        name: `${collectionName} #${index}`,
        symbol: "solana_hub",
      }));

      setPending(true);
      registerCollection(
        collectionName,
        secondsToClose,
        nftList,
        provider
      ).then((txHash: string) => {
        onCompleted?.(
          collection.id,
          txHash,
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
        {`${pluralize(queries.length, "item", "items")} in collection`}
        {isSuccess ? " - Ready to publish" : isError ? " - Failed" : ""}
      </AlertDialogDescription>
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Label className="sr-only">Progress</Label>
          <Progress
            value={(progress / queries.length) * 100}
            className="w-full"
          />
        </div>
      </div>
      <AlertDialogFooter className="flex sm:justify-between">
        <div className="flex items-center space-x-2">
          {pending && (
            <UpdateIcon className="animate-spin w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePublish} disabled={!isSuccess}>
            Publish
          </AlertDialogAction>
        </div>
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
