import { createFileRoute } from '@tanstack/react-router'
import NotFound from '@/components/pages/not-found/not-found'

export const Route = createFileRoute('/not-found')({
  component: NotFound
})