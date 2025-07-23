import { Link } from "@tanstack/react-router"
import { FormattedMessage } from "react-intl"

interface ReadStudyButtonProps {
  to: string
  messageId: string
}


const ReadStudyButton = ({ to, messageId }: ReadStudyButtonProps) => {
  return (
    < Link to={to} >
      <button
        className="
                inline-flex
                justify-center
                items-center
                bg-[#F5B524]
                hover:bg-[#F6BD3C]
                active:bg-[#DB9B0A]
                text-[#2E2E2E]
                hover:text-[#333333]
                active:text-[#212121]
                font-bold
                px-8
                py-4
                rounded-lg shadow-md
                gap-2.5
                "
      >
        <FormattedMessage
          id={messageId}
        />
      </button>
    </Link >
  )
}

export default ReadStudyButton
