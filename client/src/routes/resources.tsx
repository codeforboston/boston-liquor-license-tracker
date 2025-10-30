import { createFileRoute, redirect } from "@tanstack/react-router";
import Resources from "@/components/pages/resources/resources";

export const Route = createFileRoute("/resources")({
  // While the resources page is under construction, redirect to coming-soon
  beforeLoad: async () => {
    if (import.meta.env.PROD) {
      throw redirect({
        to: '/coming-soon'
      })
    }
  },

  component: Resources,
});
