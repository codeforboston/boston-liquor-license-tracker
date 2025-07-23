import { Link } from "@tanstack/react-router"
import { FormattedMessage } from "react-intl"

interface NavigationButtonProps {
  to: string
  messageId: string
}

const NavigationButton = ({ to, messageId }: NavigationButtonProps) => {
  return (
    <Link to={to}>
      <button className="
                flex
                justify-center
                items-center
                text-center
                w-[400px] h-[62px]
                px-[24px] py-[12px]
                rounded-[8px]
                bg-[#2E2E2E] hover:bg-[#404040] active:bg-[#1A1A1A]
                text-[#FDFDFD] hover:text-[#EAEAEA] active:text-[#F5F5F5]
                text-[32px] font-normal
                cursor-pointer
            "
      >
        <FormattedMessage id={messageId} />
      </button>
    </Link>
  )
}

export default NavigationButton
