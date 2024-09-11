"use client";

import { CollectionImageCard } from "@/components/collection/collection-image-card";
import { useAppState } from "@/hooks/useAppState";

export default function Home() {
  const collections = useAppState((state) => state.collections.published);

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Collections</h1>
        <div className="flex gap-4 mt-4">
          {Object.values(collections)
            .filter((c) => c !== undefined)
            .map((collection) => (
              <CollectionImageCard
                key={collection.id}
                item={collection.items[0]}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
