"use client";

import { useAppState } from "@/hooks/useAppState";

export default function Home() {
  const collections = useAppState((state) => state.collections.published);

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Collections</h1>
        <div className="grid grid-cols-3 gap-4">
          {Object.values(collections)
            .filter((c) => c !== undefined)
            .map((collection) => (
              <div
                key={collection.id}
                className="flex flex-col items-center justify-center w-40 h-40 bg-white rounded-lg shadow-md"
              >
                <div className="w-full h-24 bg-gray-100 rounded-t-lg" />
                <div className="flex flex-col items-center justify-center p-4">
                  <h3 className="text-lg font-semibold">{collection.name}</h3>
                  <p className="text-sm text-gray-500">
                    {collection.items.length} items
                  </p>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
