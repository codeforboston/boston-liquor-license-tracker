import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NotFound from "@/components/pages/not-found/not-found";

function NotFoundWithLayout() {
  return <NotFound />;
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundWithLayout,
});

export function RootComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeadContent />
      <Header />
      {/* min-h-screen keeps the footer below the fold while a route's code
          (auto code-split) is loading; otherwise the footer renders mid-screen
          and jumps when the page arrives, which caused most of our CLS (#288). */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootComponent;
