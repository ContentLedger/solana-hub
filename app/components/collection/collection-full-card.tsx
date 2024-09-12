import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { ImageWithFallback } from "../image-with-fallback";
import { Collection } from "@/hooks/useCreateCollectionQuery";
import { ImageIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { useAnchorProvider } from "../anchor-wallet-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bid, claim } from "@/lib/solanaHubProgram";
import { Label } from "../ui/label";
import { cn, pluralize } from "@/lib/utils";

export type CollectionFullCardProps = {
  key?: React.Key;
  id: string;
  index: number;
  name: string;
  duration: number;
  publishedAt?: string;
  txHash?: string;
  meta: {
    imageUrl: string;
    metadataUrl: string;
  };
  item: Collection;
};

export function CollectionFullCard({
  index,
  id,
  duration,
  publishedAt,
  txHash,
  meta,
  item,
}: CollectionFullCardProps) {
  const provider = useAnchorProvider();

  const auctionEnd = useMemo(
    () =>
      publishedAt
        ? new Date(publishedAt).getTime() + (duration ?? 360) * 1000
        : Date.now() + (duration ?? 360) * 1000,
    [publishedAt, duration]
  );

  const [auctionTimer, setAuctionTimer] = useState<number>(
    Math.max(0, auctionEnd - Date.now())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= auctionEnd) {
        clearInterval(interval);
        return;
      }
      setAuctionTimer(Math.max(0, auctionEnd - now));
    }, 1000);
    return () => clearInterval(interval);
  }, [auctionEnd]);

  const handleBidClick = useCallback(() => {
    const collectionName = `collection-${id}`;
    const nftId = index + 1;
    const amount = prompt("Please enter your bid amount", "0.1");
    const bidAmount = parseFloat(amount || "0.1") * 10 ** 9;
    console.log("Bid amount", bidAmount);
    bid(collectionName, nftId, bidAmount, provider).then((value: string) => {
      console.log("Transaction sent", value);
    });
  }, [index, id, provider]);

  const handleClaimClick = useCallback(() => {
    const collectionName = `collection-${id}`;
    const nftId = index + 1;
    claim(collectionName, nftId, provider).then((value: string) => {
      console.log("Transaction sent", value);
    });
    console.log("Claim clicked", {
      collectionName,
      nftId,
    });
  }, [index, id, provider]);

  return (
    <div className="flex flex-row w-full gap-12 bg-background border rounded-lg shadow-md overflow-hidden">
      <div className="flex w-[600px]">
        <AspectRatio ratio={1 / 1}>
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
      </div>
      <div className="flex flex-1 flex-col justify-between pt-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-6xl font-semibold">{item.name}</h3>
          <p className="text-lg">{item.description}</p>
          <div className="flex flex-col my-2 gap-2 space-y-1.5">
            {txHash && (
              <div className="flex flex-col space-y-1.5">
                <Label>Transaction Hash</Label>
                <a
                  href={formatHashUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="flex gap-2 items-center text-muted-foreground">
                    <span className="underline underline-offset-4">
                      {txHash}
                    </span>
                    <OpenInNewWindowIcon />
                  </span>
                </a>
              </div>
            )}
            {meta.imageUrl && (
              <div className="flex flex-col space-y-1.5">
                <Label>Image</Label>
                <a href={meta.imageUrl} target="_blank" rel="noreferrer">
                  <span className="flex gap-2 items-center text-muted-foreground">
                    <span className="underline underline-offset-4">
                      {meta.imageUrl}
                    </span>
                    <OpenInNewWindowIcon />
                  </span>
                </a>
              </div>
            )}
            {meta.metadataUrl && (
              <div className="flex flex-col space-y-1.5">
                <Label>Metadata</Label>
                <a
                  className="flex gap-2 items-center"
                  href={meta.metadataUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="flex gap-2 items-center text-muted-foreground">
                    <span className="underline underline-offset-4">
                      {meta.metadataUrl}
                    </span>
                    <OpenInNewWindowIcon />
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 justify-between items-center p-8 pl-0">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold">Auction End</h3>
              <h4
                className={cn(
                  "text-sm text-muted-foreground",
                  auctionTimer <= 0 ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {pluralize(
                  Math.floor(auctionTimer / 1000),
                  "second",
                  "seconds"
                )}
              </h4>
            </div>
            <div className="flex justify-end items-center gap-4">
              <Button variant="default" onClick={handleBidClick}>
                Bid
              </Button>
              <Button variant="secondary" onClick={handleClaimClick}>
                Claim
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatHashUrl(txHash: string) {
  return `https://explorer.solana.com/tx/${txHash}?cluster=${process.env.NEXT_PUBLIC_WALLET_NETWORK}`;
}
