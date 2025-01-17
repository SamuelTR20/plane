"use client";

import { ReactNode, createContext } from "react";
import { ThemeProvider } from "next-themes";
// store
import { RootStore } from "@/store/root.store";
// store initialization
import { AppWrapper } from "./app-wrapper";

let rootStore = new RootStore();

export const StoreContext = createContext(rootStore);

function initializeStore(initialData = {}) {
  const singletonRootStore = rootStore ?? new RootStore();
  // If your page has Next.js data fetching methods that use a Mobx store, it will
  // get hydrated here, check `pages/ssg.js` and `pages/ssr.js` for more details
  if (initialData) {
    singletonRootStore.hydrate(initialData);
  }
  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return singletonRootStore;
  // Create the store once in the client
  if (!rootStore) rootStore = singletonRootStore;
  return singletonRootStore;
}

export type AppProviderProps = {
  children: ReactNode;
  initialState: any;
};

export const AppProvider = ({ children, initialState = {} }: AppProviderProps) => {
  const store = initializeStore(initialState);

  return (
    <ThemeProvider themes={["light", "dark"]} defaultTheme="system" enableSystem>
      <StoreContext.Provider value={store}>
        <AppWrapper>{children}</AppWrapper>
      </StoreContext.Provider>
    </ThemeProvider>
  );
};
