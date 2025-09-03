import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NotFound from "@/components/pages/not-found/not-found";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});

export function RootComponent() {
  return (
    <>
      <HeadContent />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default RootComponent;
