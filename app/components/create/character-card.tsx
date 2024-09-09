"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import React, { useCallback, useRef } from "react";
import { DotsHorizontalIcon, PersonIcon } from "@radix-ui/react-icons";
import { AspectRatio } from "../ui/aspect-ratio";
import { ImageWithFallback } from "../image-with-fallback";

export type CharacterCardData = {
  name: string;
  description: string;
  image: string;
};

export type CharacterCardProps = CharacterCardData & {
  editable?: boolean;
  onChange?: (data: CharacterCardData) => void;
  onAdd?: (data: CharacterCardData) => void;
};

export function CharacterCard({
  name,
  description,
  image,
  editable = false,
  onAdd,
  onChange,
}: CharacterCardProps) {
  const formRefs = useRef({
    name: null as HTMLInputElement | null,
    description: null as HTMLInputElement | null,
    image: null as HTMLInputElement | null,
  });

  const handleChange = useCallback(() => {
    onChange?.({
      name: formRefs.current["name"]?.value ?? "",
      description: formRefs.current["description"]?.value ?? "",
      image: formRefs.current["image"]?.value ?? "",
    });
  }, [onChange]);

  const handleAdd = useCallback(() => {
    onAdd?.({
      name: formRefs.current["name"]?.value ?? "",
      description: formRefs.current["description"]?.value ?? "",
      image: formRefs.current["image"]?.value ?? "",
    });
  }, [onAdd]);

  const submitEnabled = name && description && image && editable;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{name || <DotsHorizontalIcon />}</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-12">
        <div className="w-40">
          <AspectRatio ratio={1 / 1}>
            <ImageWithFallback
              src={image}
              alt={name}
              fill={true}
              className="object-cover w-full h-full rounded-md border-2"
              fallback={() => (
                <PersonIcon className="object-center w-full h-full rounded-md border-2 text-muted" />
              )}
            />
          </AspectRatio>
        </div>
        <form className="w-full">
          <div className="grid lg:grid-cols-[max-content_1fr] grid-cols-1 w-full items-center gap-2 gap-x-4">
            <Label htmlFor="name">Name</Label>
            <Input
              ref={(el) => void (formRefs.current["name"] = el)}
              name="name"
              placeholder="Name of your character"
              value={name}
              disabled={!editable}
              onChange={handleChange}
            />

            <Label htmlFor="description" className="pt-2 lg:pt-0">
              Description
            </Label>
            <Input
              ref={(el) => void (formRefs.current["description"] = el)}
              name="description"
              placeholder="Description"
              value={description}
              disabled={!editable}
              onChange={handleChange}
            />

            <Label htmlFor="image" className="pt-2 lg:pt-0">
              Image
            </Label>
            <Input
              ref={(el) => void (formRefs.current["image"] = el)}
              name="image"
              placeholder="Image URL"
              value={image}
              disabled={!editable}
              onChange={handleChange}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          className={editable ? "visible" : "invisible"}
          onClick={handleAdd}
          disabled={!submitEnabled}
          hidden={!editable}
        >
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
