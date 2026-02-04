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
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootComponent;
