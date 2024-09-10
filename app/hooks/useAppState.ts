import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Collection = {
  name: string;
  description: string;
  image: string;
};

type AppState = {
  collection: Array<Collection>;
  actions: {
    add: (collection: Collection) => void;
    update: (collection: Collection, idx: number) => void;
    last: (collection: Collection) => void;
    clear: () => void;
  };
};

export const useAppState = create(
  persist<AppState, [], [], Pick<AppState, "collection">>(
    (set) => ({
      collection: [{ name: "", description: "", image: "" }],
      actions: {
        add: (collection) =>
          set((state) => ({ collection: [...state.collection, collection] })),
        update: (collection, idx) => {
          set((state) => {
            state.collection[idx] = { ...state.collection[idx], ...collection };
            return { collection: [...state.collection] };
          });
        },
        last: (collection) =>
          set((state) => ({
            collection: state.collection.slice(0, -1).concat(collection),
          })),
        clear: () =>
          set({ collection: [{ name: "", description: "", image: "" }] }),
      },
    }),
    {
      name: "app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collection: state.collection,
      }),
    }
  )
);
