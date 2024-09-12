"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
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
import { CreateCollectionDetails } from "@/components/create/create-collection-details";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";

type CreateProps = {
  params: {
    id: string;
  };
};

export default function Collection({ params }: CreateProps) {
  const router = useRouter();
  const collection = useAppState(
    (state) => state.collections.drafts[params.id]
  );
  if (!collection) redirect("/");

  const { update, publish } = useAppState((state) => state.actions.collection);
  const [submit, setSubmit] = useState(false);

  const createEnabled = useMemo(
    () =>
      collection.items.length > 1 ||
      (collection.items.length &&
        Object.values(collection.items[0]).every((i) => i)),
    [collection]
  );

  const handleAdd = useCallback(() => {
    update(collection.id, collection.name, collection.duration, {
      name: "",
      description: "",
      image: "",
    });
  }, [update, collection]);

  const handleItemChange = useCallback(
    (data: CharacterCardData) => {
      update(
        collection.id,
        collection.name,
        collection.duration,
        data,
        collection.items.length - 1
      );
    },
    [update, collection]
  );

  const handleCollectionChange = useCallback(
    (name: string, duration: number) => {
      update(collection.id, name, duration);
    },
    [update, collection]
  );

  const handleCompleted = useCallback(
    (id: string, txHash: string, results: CreateCollectionResults) => {
      console.log("Collection created", id, results);
      publish(id, txHash, results);
      setTimeout(() => router.push(`/collection/${id}`), 1);
    },
    [publish]
  );

  return (
    <div className="flex flex-col p-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-2xl font-bold">
            <BreadcrumbLink asChild>
              <Link href="/create">{collection.name || "New Collection"}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-8">
        <main className="basis-3/4">
          <div className="flex flex-col gap-4 mt-8">
            {collection.items.map((data, index) => (
              <CharacterCard
                key={`${collection.id}-${index}`}
                {...data}
                editable={index === collection.items.length - 1}
                onChange={handleItemChange}
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
        <aside className="mt-8 basis-1/4">
          <CreateCollectionDetails
            name={collection.name}
            duration={collection.duration}
            onChange={handleCollectionChange}
          />
        </aside>
      </div>
    </div>
  );
}
