"use client";

import { useCallback, useState } from "react";
import {
  CharacterCard,
  CharacterCardData,
} from "@/components/create/character-card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/useAppState";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateCollectionDialog } from "@/components/create/create-collection-dialog";

export default function Create() {
  const collection = useAppState((state) => state.collection);
  const { add, last, clear } = useAppState((state) => state.actions);
  const [submit, setSubmit] = useState(false);

  const handleAdd = useCallback(() => {
    add({ name: "", description: "", image: "" });
  }, [add]);

  const handleChange = useCallback(
    (data: CharacterCardData) => {
      last(data);
    },
    [last]
  );

  const handleCompleted = useCallback(() => {
    setSubmit(false);
    clear();
  }, [clear]);

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
              collection={collection}
              open={submit}
              onCompleted={handleCompleted}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
}
