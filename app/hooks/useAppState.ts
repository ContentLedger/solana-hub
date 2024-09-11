import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval"; // can use anything: IndexedDB, Ionic Storage, etc.

type Collection = {
  id: string;
  name: string;
  createdAt: string;
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
      [id: string]: Collection;
    };
    drafts: {
      [id: string]: Collection;
    };
    activeDraft: string | null;
  };
  actions: {
    collection: {
      create: (name: string) => string;
      update: (id: string, item: Collection["items"][0], idx?: number) => void;
      destroy: (id: string | null) => void;
      publish: (id: string, meta: Collection["meta"]) => void;
    };
  };
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

          update: (id, item, idx) => {
            if (idx === undefined) {
              set((state) => ({
                ...state,
                collections: {
                  ...state.collections,
                  drafts: {
                    ...state.collections.drafts,
                    [id]: {
                      ...state.collections.drafts[id],
                      items: [...state.collections.drafts[id].items, item],
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
                    [id]: {
                      ...state.collections.drafts[id],
                      items: [
                        ...state.collections.drafts[id].items.map((data, i) =>
                          i === idx ? { ...data, ...item } : data
                        ),
                      ],
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
                published: Object.keys(state.collections.published)
                  .filter((d) => d !== id)
                  .reduce((acc, d) => {
                    acc[d] = state.collections.published[d];
                    return acc;
                  }, {} as AppState["collections"]["published"]),
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

          publish: (id, meta) => {
            set((state) => {
              const draft = state.collections.drafts[id];
              draft.items = draft.items.slice(0, meta.length);
              draft.meta = { ...meta };
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
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        collections: state.collections,
      }),
    }
  )
);

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof indexedDB === "undefined") return null;
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof indexedDB === "undefined") return;
    await del(name);
  },
};
