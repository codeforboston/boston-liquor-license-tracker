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
                bg-case-study-button-default-yellow
                hover:bg-case-study-button-hover-yellow
                active:bg-case-study-button-active-yellow
                text-font-dark
                hover:text-button-active-dark
                active:text-[--color-button-hovered-dark]
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
