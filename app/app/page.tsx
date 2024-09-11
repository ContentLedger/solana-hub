"use client";

import { CollectionImageCard } from "@/components/collection/collection-image-card";
import { useAppState } from "@/hooks/useAppState";
import Link from "next/link";

export default function Home() {
  const collections = useAppState((state) => state.collections.published);

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Collections</h1>
        <div className="flex gap-8 mt-8">
          {Object.values(collections)
            .filter((c) => c !== undefined)
            .map((collection) => (
              <Link key={collection.id} href={`/collection/${collection.id}`}>
                <CollectionImageCard
                  item={collection.items[0]}
                  count={collection.items.length}
                />
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
