"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CharacterCard,
  CharacterCardData,
} from "@/components/create/character-card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/useAppState";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  CreateCollectionDialog,
  CreateCollectionResults,
} from "@/components/create/create-collection-dialog";
import { registerCollection } from "@/lib/solanaHubProgram";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";

export default function Create() {
  const collection = useAppState((state) => state.collection);
  const { add, last, clear } = useAppState((state) => state.actions);
  const [submit, setSubmit] = useState(false);
  const provider = useAnchorProvider();

  // TODO: refactor to support multiple collections
  // TODO: reload the page for a new collection until I fix this in the data store
  const namedCollection = useMemo(
    () => ({
      id: Math.random().toString(36).substring(7),
      items: collection,
    }),
    [collection]
  );

  const handleAdd = useCallback(() => {
    add({ name: "", description: "", image: "" });
  }, [add]);

  const handleChange = useCallback(
    (data: CharacterCardData) => {
      last(data);
    },
    [last]
  );

  const handleCompleted = useCallback(
    (id: string, results: CreateCollectionResults) => {
      console.log("Collection created", id, results);
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
    [clear, provider]
  );

  return (
    <div className="flex justify-stretch">
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">New Collection</h1>
        <div className="flex flex-col gap-4 mt-4">
          {collection.map((data, index) => (
            <CharacterCard
              key={index}
              {...data}
              editable={index === collection.length - 1}
              onChange={handleChange}
              onAdd={handleAdd}
            />
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Dialog onOpenChange={(open) => setSubmit(open)}>
            <DialogTrigger asChild>
              <Button variant="default" className="text-lg">
                Create Collection
              </Button>
            </DialogTrigger>
            <CreateCollectionDialog
              collection={namedCollection}
              open={submit}
              onCompleted={handleCompleted}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
}
