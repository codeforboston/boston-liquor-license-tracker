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
                bg-button-default-dark hover:bg-button-hovered-dark active:bg-button-active-dark
                text-button-default-light hover:text-button-hovered-light active:text-button-active-light
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
