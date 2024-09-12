"use client";

import { useAppState } from "@/hooks/useAppState";
import { redirect } from "next/navigation";
import { CollectionImageCard } from "@/components/collection/collection-image-card";
import { Button } from "@/components/ui/button";
import { bid, claim } from "@/lib/solanaHubProgram";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";

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

  const provider = useAnchorProvider();

  const onBidClick = (index: number) => {
    const collectionName = `collection-${collection.id}`;
    const nftId = index + 1;
    let amount = prompt("Please enter your bid amount", "0.1");
    const bidAmount = parseFloat(amount || "0.1") * 10 ** 9;
    console.log("Bid amount", bidAmount);
    bid(collectionName, nftId, bidAmount, provider).then((value: string) => {
      console.log("Transaction sent", value);
    });
  };

  const onClaimClick = (index: number) => {
    const collectionName = `collection-${collection.id}`;
    const nftId = index + 1;
    claim(collectionName, nftId, provider).then((value: string) => {
      console.log("Transaction sent", value);
    });
    console.log("Claim clicked", {
      collectionName,
      nftId,
    });
  };

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">{collection?.name}</h1>
        <div className="flex gap-8 mt-8">
          {collection?.items.map((item, idx) => (
            <div className="flex flex-col gap-1">
              <CollectionImageCard key={idx} item={item} />
              <Button
                className="bg-background text-foreground"
                onClick={() => {
                  onBidClick(idx);
                }}
              >
                Bid
              </Button>
              <Button
                className="bg-background text-foreground"
                onClick={() => {
                  onClaimClick(idx);
                }}
              >
                Claim
              </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
