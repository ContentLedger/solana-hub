"use client";

import { useAppState } from "@/hooks/useAppState";
import { redirect } from "next/navigation";
import { CollectionImageCard } from "@/components/collection/collection-image-card";

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
            <CollectionImageCard key={idx} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}
