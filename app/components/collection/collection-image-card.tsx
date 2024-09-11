import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { ImageWithFallback } from "../image-with-fallback";
import { Collection } from "@/hooks/useCreateCollectionQuery";
import { ImageIcon } from "@radix-ui/react-icons";

export type CollectionImageCardProps = {
  item: Collection;
  count?: number;
};

export function CollectionImageCard({ item, count }: CollectionImageCardProps) {
  return (
    <div className="flex flex-col items-center justify-end w-[300px] h-[300px] bg-background border rounded-lg shadow-md overflow-hidden">
      <AspectRatio ratio={1 / 1} className="">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="object-cover w-full h-full"
        >
          <div className="flex items-center justify-center w-full h-full p-4 text-muted-foreground">
            <ImageIcon />
          </div>
        </ImageWithFallback>
      </AspectRatio>
      <div className="flex flex-col items-center justify-center p-2">
        <h3 className="text-lg font-semibold">Collection Name</h3>
        {count ? <p className="text-sm text-gray-500">{count} items</p> : null}
      </div>
    </div>
  );
}
