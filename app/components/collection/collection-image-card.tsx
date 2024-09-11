import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { ImageWithFallback } from "../image-with-fallback";
import { Collection } from "@/hooks/useCreateCollectionQuery";
import { ImageIcon } from "@radix-ui/react-icons";

export type CollectionImageCardProps = {
  item: Collection;
};

export function CollectionImageCard({ item }: CollectionImageCardProps) {
  return (
    <div className="flex flex-col items-center justify-center w-40 h-40 bg-white rounded-lg shadow-md">
      <AspectRatio ratio={1 / 1}>
        <ImageWithFallback src={item.image} alt={item.name}>
          <div className="flex items-center justify-center w-full h-full p-4 text-muted-foreground">
            <ImageIcon />
          </div>
        </ImageWithFallback>
      </AspectRatio>
      <div className="flex flex-col items-center justify-center p-4">
        <h3 className="text-lg font-semibold">Collection Name</h3>
        <p className="text-sm text-gray-500">3 items</p>
      </div>
    </div>
  );
}
