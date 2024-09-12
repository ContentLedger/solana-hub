"use client";

import { CollectionImageCard } from "@/components/collection/collection-image-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { useAppState } from "@/hooks/useAppState";
import Link from "next/link";

export default function Home() {
  const collections = useAppState((state) => state.collections.published);

  return (
    <div className="flex">
      <main className="flex-1 p-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="text-2xl font-bold">
              <BreadcrumbLink asChild>
                <Link href="/">Collections</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-wrap gap-8 mt-8">
          {Object.values(collections)
            .filter((c) => c !== undefined)
            .map((collection) => (
              <Link key={collection.id} href={`/collection/${collection.id}`}>
                <CollectionImageCard
                  item={{ ...collection.items[0], name: collection.name }}
                  count={collection.items.length}
                />
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
