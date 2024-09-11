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
import { DotsHorizontalIcon, ImageIcon } from "@radix-ui/react-icons";
import { AspectRatio } from "../ui/aspect-ratio";
import { Textarea } from "../ui/textarea";
import { ImageDropTarget } from "../image-drop-target";

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
    description: null as HTMLTextAreaElement | null,
    image,
  });

  const handleChange = useCallback(() => {
    onChange?.({
      name: formRefs.current["name"]?.value ?? "",
      description: formRefs.current["description"]?.value ?? "",
      image: formRefs.current["image"] ?? "",
    });
  }, [onChange]);

  const handleAdd = useCallback(() => {
    onAdd?.({
      name: formRefs.current["name"]?.value ?? "",
      description: formRefs.current["description"]?.value ?? "",
      image: formRefs.current["image"] ?? "",
    });
  }, [onAdd]);

  const handleDrop = useCallback(
    (dataUrl: string) => {
      formRefs.current["image"] = dataUrl;
      handleChange();
    },
    [handleChange]
  );

  const submitEnabled = name && description && image && editable;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{name || <DotsHorizontalIcon />}</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-12">
        <div className="w-48 flex-shrink-0">
          <AspectRatio ratio={1 / 1}>
            <ImageDropTarget
              src={image}
              onDrop={handleDrop}
              disabled={!editable}
            >
              <div className="flex flex-col items-center justify-center w-full h-full p-4 text-muted-foreground">
                <ImageIcon className="w-full h-full text-muted-foreground" />
                <span className="text-xs">Drag & Drop Image</span>
              </div>
            </ImageDropTarget>
          </AspectRatio>
        </div>
        <form className="w-full">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                ref={(el) => void (formRefs.current["name"] = el)}
                name="name"
                placeholder="Name of your character"
                value={name}
                disabled={!editable}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                className="min-h-[102px]"
                ref={(el) => void (formRefs.current["description"] = el)}
                name="description"
                placeholder="Description"
                value={description}
                disabled={!editable}
                onChange={handleChange}
              />
            </div>
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
