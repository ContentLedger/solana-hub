"use client";

import { useAppState } from "@/hooks/useAppState";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { CollectionFullCard } from "@/components/collection/collection-full-card";

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

  return (
    <div className="flex flex-col p-8">
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
      <div className="flex gap-8">
        <main className="flex-1">
          <div className="flex flex-col gap-8 mt-8">
            {collection?.items.map((item, idx) => (
              <div key={idx} className="flex gap-1 h-[500px]">
                <CollectionFullCard
                  index={idx}
                  id={collection.id}
                  name={collection.name}
                  duration={collection.duration}
                  txHash={collection.txHash}
                  meta={collection.meta[idx]}
                  publishedAt={collection.publishedAt}
                  item={item}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
