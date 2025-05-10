import * as React from "react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import logo from "../assets/logo.svg";
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

