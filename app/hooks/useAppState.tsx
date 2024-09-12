"use client";

import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.
import { useEffect } from "react";

type Collection = {
  id: string;
  name: string;
  duration: number;
  txHash?: string;
  createdAt: string;
  publishedAt?: string;
  items: Array<{
    name: string;
    description: string;
    image: string;
  }>;
  meta: Array<{
    metadataUrl: string;
    imageUrl: string;
  }>;
};

type AppState = {
  collections: {
    published: {
      [id: string]: Collection | undefined;
    };
    drafts: {
      [id: string]: Collection | undefined;
    };
    activeDraft: string | null;
  };
  actions: {
    collection: {
      create: (name: string) => string;
      update: (
        id: string,
        name: string,
        dur: number,
        item?: Collection["items"][0],
        idx?: number
      ) => void;
      destroy: (id: string | null) => void;
      publish: (id: string, txHash: string, meta: Collection["meta"]) => void;
    };
  };
};

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof indexedDB === "undefined") throw Error("indexedDB unavailable");
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof indexedDB === "undefined") throw Error("indexedDB unavailable");
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof indexedDB === "undefined") throw Error("indexedDB unavailable");
    await del(name);
  },
};

export const useAppState = create(
  persist<AppState, [], [], Pick<AppState, "collections">>(
    (set) => ({
      collections: {
        published: {},
        drafts: {},
        activeDraft: null,
      },
      actions: {
        collection: {
          create: (name) => {
            const id = Math.random().toString(36).substring(7);
            set((state) => ({
              ...state,
              collections: {
                ...state.collections,
                drafts: {
                  ...state.collections.drafts,
                  [id]: {
                    id,
                    name,
                    duration: 360,
                    createdAt: new Date().toISOString(),
                    items: [{ name: "", description: "", image: "" }],
                    meta: [],
                  },
                },
                activeDraft: id,
              },
            }));
            return id;
          },

          update: (id, name, duration, item, idx) => {
            if (idx === undefined) {
              set((state) => ({
                ...state,
                collections: {
                  ...state.collections,
                  drafts: {
                    ...state.collections.drafts,
                    [id]: state.collections.drafts[id]
                      ? {
                          ...state.collections.drafts[id],
                          name,
                          duration,
                          items: item
                            ? [...state.collections.drafts[id].items, item]
                            : state.collections.drafts[id].items,
                        }
                      : {
                          id,
                          name,
                          duration,
                          createdAt: new Date().toISOString(),
                          items: item ? [item] : [],
                          meta: [],
                        },
                  },
                },
              }));
            } else {
              set((state) => ({
                ...state,
                collections: {
                  ...state.collections,
                  drafts: {
                    ...state.collections.drafts,
                    [id]: state.collections.drafts[id]
                      ? {
                          ...state.collections.drafts[id],
                          items: [
                            ...state.collections.drafts[id].items.map(
                              (data, i) =>
                                item && i === idx ? { ...data, ...item } : data
                            ),
                          ],
                        }
                      : {
                          id,
                          name,
                          duration,
                          createdAt: new Date().toISOString(),
                          items: item ? [item] : [],
                          meta: [],
                        },
                  },
                },
              }));
            }
          },

          destroy: (id) => {
            if (!id) return;
            set((state) => ({
              ...state,
              collections: {
                ...state.collections,
                /*
                published: Object.keys(state.collections.published)
                  .filter((d) => d !== id)
                  .reduce((acc, d) => {
                    acc[d] = state.collections.published[d];
                    return acc;
                  }, {} as AppState["collections"]["published"]),
                  */
                drafts: Object.keys(state.collections.drafts)
                  .filter((d) => d !== id)
                  .reduce((acc, d) => {
                    acc[d] = state.collections.drafts[d];
                    return acc;
                  }, {} as AppState["collections"]["drafts"]),
                activeDraft:
                  state.collections.activeDraft === id
                    ? null
                    : state.collections.activeDraft,
              },
            }));
          },

          publish: (id, txHash, meta) => {
            set((state) => {
              const draft = state.collections.drafts[id];
              if (!draft) return state;
              draft.items = draft.items.slice(0, meta.length);
              draft.txHash = txHash;
              draft.publishedAt = new Date().toISOString();
              draft.meta = [...meta];
              return {
                ...state,
                collections: {
                  published: {
                    ...state.collections.published,
                    [id]: { ...draft },
                  },
                  drafts: Object.keys(state.collections.drafts)
                    .filter((d) => d !== id)
                    .reduce((acc, d) => {
                      acc[d] = state.collections.drafts[d];
                      return acc;
                    }, {} as AppState["collections"]["drafts"]),
                  activeDraft: null,
                },
              };
            });
          },
        },
      },
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => {
        if (typeof indexedDB === "undefined")
          throw new Error("indexedDB unavailable");
        return storage;
      }),
      partialize: (state) => ({
        collections: state.collections,
      }),
      skipHydration: true,
    }
  )
);

export default function AppStateConsumer({
  children,
}: React.PropsWithChildren<unknown>) {
  useEffect(() => {
    useAppState.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
