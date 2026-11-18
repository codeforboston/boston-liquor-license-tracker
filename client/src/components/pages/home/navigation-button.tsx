import { Link } from "@tanstack/react-router"
import { FormattedMessage } from "react-intl"
import { Button } from "@/components/ui/button"

interface NavigationButtonProps {
  to: string
  messageId: string
}

const NavigationButton = ({ to, messageId }: NavigationButtonProps) => {
  return (
    <Button asChild size="xl" className="flex w-full md:flex-1 md:max-w-[400px]">
      <Link to={to}>
        <FormattedMessage id={messageId} />
      </Link>
    </Button>
  )
}

export default NavigationButton
