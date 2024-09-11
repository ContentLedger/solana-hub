"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CharacterCard,
  CharacterCardData,
} from "@/components/create/character-card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/useAppState";
import {
  CreateCollectionDialog,
  CreateCollectionResults,
} from "@/components/create/create-collection-dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { registerCollection } from "@/lib/solanaHubProgram";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";

export default function Create() {
  const { drafts, activeDraft } = useAppState((state) => state.collections);
  const { create, update, destroy, publish } = useAppState(
    (state) => state.actions.collection
  );
  const [submit, setSubmit] = useState(false);
  const provider = useAnchorProvider();

  useEffect(() => {
    return () => destroy(activeDraft);
  }, [create, destroy, activeDraft]);

  const collection = useMemo(() => {
    if (activeDraft && drafts[activeDraft]) return drafts[activeDraft];
    create("New Collection");
    return { id: "", items: [] };
  }, [activeDraft, create, drafts]);

  const createEnabled = useMemo(
    () =>
      collection.items.length > 1 ||
      (collection.items.length &&
        Object.values(collection.items[0]).every((i) => i)),
    [collection]
  );

  const handleAdd = useCallback(() => {
    update(collection.id, { name: "", description: "", image: "" });
  }, [update, collection]);

  const handleChange = useCallback(
    (data: CharacterCardData) => {
      update(collection.id, data, collection.items.length - 1);
    },
    [update, collection]
  );

  const handleCompleted = useCallback(
    (id: string, results: CreateCollectionResults) => {
      console.log("Collection created", id, results);
      // TODO: Move the onCompleted logic that calls the solana program
      //       to create-collection-dialog.tsx in the handlePublish callback
      publish(id, results);
      setSubmit(false);
      clear();

      const collectionName = `collection-${id}`;
      const secondsToClose = 360;
      const nftList = results.map((result, index) => ({
        uri: result.metadataUrl,
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
      });
    },
    [clear, publish, provider]
  );

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">New Collection</h1>
        <div className="flex flex-col gap-4 mt-4">
          {collection.items.map((data, index) => (
            <CharacterCard
              key={index}
              {...data}
              editable={index === collection.items.length - 1}
              onChange={handleChange}
              onAdd={handleAdd}
            />
          ))}
        </div>
        <div className="flex justify-end mt-8">
          <AlertDialog onOpenChange={(open) => setSubmit(open)} open={submit}>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                className="text-lg animated-background hover:bg-gradient-to-r hover:from-yellow-500 hover:via-orange-500 hover:to-red-500"
                disabled={!createEnabled}
              >
                Create Collection
              </Button>
            </AlertDialogTrigger>
            <CreateCollectionDialog
              collection={collection}
              submit={submit}
              onCompleted={handleCompleted}
            />
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}
