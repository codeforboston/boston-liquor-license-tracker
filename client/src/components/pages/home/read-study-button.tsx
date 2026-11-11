import { FormattedMessage } from "react-intl"
import { Button } from "@/components/ui/button"

interface ReadStudyButtonProps {
  href: string
  messageId: string
}

const ReadStudyButton = ({ href, messageId }: ReadStudyButtonProps) => {
  return (
    <Button asChild variant="accent" size="lg">
      <a href={href}>
        <FormattedMessage id={messageId} />
      </a>
    </Button>
  )
}

export default ReadStudyButton
