import { createFileRoute, redirect } from "@tanstack/react-router";
import Maps from "@/components/pages/maps/maps";

export const Route = createFileRoute("/maps")({
  // While the map page is under construction, redirect to coming-soon
  beforeLoad: async () => {
    if (import.meta.env.PROD) {
      throw redirect({
        to: '/coming-soon'
      })
    }
  },

  component: Maps,
});
