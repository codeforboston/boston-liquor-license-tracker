import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";

import "./index.css";
import "./App.css";
import I18n from "./i18n/I18n";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Use hash history for routing instead of browser history
// github pages does not route arbitrary URLs to index.html
const hashHistory = createHashHistory();

// Create a new router instance
const router = createRouter({ routeTree, history: hashHistory });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <I18n>
        <RouterProvider router={router} />
      </I18n>
    </StrictMode>
  );
}
