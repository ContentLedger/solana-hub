"use client";

import {
  CharacterCard,
  CharacterCardData,
} from "@/components/create/character-card";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

export default function Create() {
  const [collection, setCollection] = useState<CharacterCardData[]>([
    { name: "", description: "", image: "" },
  ]);

  const handleAdd = useCallback(() => {
    setCollection((prev) => [
      ...prev,
      { name: "", description: "", image: "" },
    ]);
  }, []);

  const handleChange = useCallback((data: CharacterCardData) => {
    setCollection((prev) => prev.slice(0, -1).concat(data));
  }, []);

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
          <Button variant="outline" className="text-lg">
            Create Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
