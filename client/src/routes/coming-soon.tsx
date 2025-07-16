import ComingSoon from "@components/pages/coming-soon/coming-soon.tsx";
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/coming-soon')({
  component: ComingSoon,
})