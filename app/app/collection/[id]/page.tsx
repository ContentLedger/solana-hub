"use client";

import { useAppState } from "@/hooks/useAppState";
import { redirect } from "next/navigation";
import { CollectionImageCard } from "@/components/collection/collection-image-card";
import { Button } from "@/components/ui/button";

type ViewProps = {
  params: {
    id: string;
  };
};

export default function View({ params }: ViewProps) {
  const collection = useAppState(
    (state) => state.collections.published[params.id]
  );
  if (!collection) redirect("/");

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">{collection?.name}</h1>
        <div className="flex gap-8 mt-8">
          {collection?.items.map((item, idx) => (
            <div className="flex flex-col gap-1">
              <CollectionImageCard key={idx} item={item} />
              <Button
                className="bg-background text-foreground"
                onClick={() => {}}
              >
                Bid
              </Button>
              <Button
                className="bg-background text-foreground"
                onClick={() => {}}
              >
                Claim
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
