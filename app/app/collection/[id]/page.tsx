"use client";

import { useAppState } from "@/hooks/useAppState";
import { redirect } from "next/navigation";
import { CollectionImageCard } from "@/components/collection/collection-image-card";
import { Button } from "@/components/ui/button";
import { bid, claim } from "@/lib/solanaHubProgram";
import { useAnchorProvider } from "@/components/anchor-wallet-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useCallback } from "react";

type CollectionProps = {
  params: {
    id: string;
  };
};

export default function Collection({ params }: CollectionProps) {
  const collection = useAppState(
    (state) => state.collections.published[params.id]
  );
  if (!collection) redirect("/");

  const provider = useAnchorProvider();

  const onBidClick = useCallback(
    (index: number) => {
      const collectionName = `collection-${collection.id}`;
      const nftId = index + 1;
      let amount = prompt("Please enter your bid amount", "0.1");
      const bidAmount = parseFloat(amount || "0.1") * 10 ** 9;
      console.log("Bid amount", bidAmount);
      bid(collectionName, nftId, bidAmount, provider).then((value: string) => {
        console.log("Transaction sent", value);
      });
    },
    [collection, provider]
  );

  const onClaimClick = useCallback(
    (index: number) => {
      const collectionName = `collection-${collection.id}`;
      const nftId = index + 1;
      claim(collectionName, nftId, provider).then((value: string) => {
        console.log("Transaction sent", value);
      });
      console.log("Claim clicked", {
        collectionName,
        nftId,
      });
    },
    [collection, provider]
  );

  return (
    <div className="flex justify-stretch">
      <main className="flex-1 p-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="text-2xl font-bold">
              <BreadcrumbLink asChild>
                <Link href="/">Collections</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="text-2xl font-bold">
              <BreadcrumbLink asChild>
                <Link href={`/collection/${collection.id}`}>
                  {collection.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
