import { useQueries } from "@tanstack/react-query";

export type Collection = {
  name: string;
  description: string;
  image: string;
};

export type CollectionResults = {
  metadataUrl: string;
  imageUrl: string;
};

export function useCreateCollectionQuery(
  key: string,
  collection: Array<Collection>,
  creatorPubKey: string
) {
  const queries = useQueries({
    queries: collection
      .filter((c) => c.name && c.description && c.image)
      .map((collection, idx) => ({
        queryKey: [key, idx],
        staleTime: Infinity,
        queryFn: async () => {
          await new Promise((resolve) => setTimeout(resolve, 200 * idx));
          const blob = await (await fetch(collection.image)).blob();
          const formData = new FormData();
          formData.append("file", blob);
          formData.append(
            "metadata",
            JSON.stringify({
              name: collection.name,
              description: collection.description,
              creator: creatorPubKey,
            })
          );
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          return data as CollectionResults;
        },
      })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isSuccess = queries.every((query) => query.isSuccess);
  const isError = queries.some((query) => query.isError);
  const progress = queries.filter((query) => query.isSuccess).length;

  return { queries, isLoading, isSuccess, isError, progress };
}
