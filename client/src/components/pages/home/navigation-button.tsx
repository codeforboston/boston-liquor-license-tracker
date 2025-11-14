import { Link } from "@tanstack/react-router"
import { FormattedMessage } from "react-intl"

interface NavigationButtonProps {
  to: string
  messageId: string
}

const NavigationButton = ({ to, messageId }: NavigationButtonProps) => {
  return (
    <Link to={to} className="
      flex
      justify-center
      items-center
      text-center
      w-full md:w-[400px]
      min-h-[34px] md:min-h-[62px]
      px-[24px] py-[8px] md:py-[12px]
      rounded-[8px]
      bg-button-default-dark hover:bg-button-hovered-dark active:bg-button-active-dark
      text-button-default-light hover:text-button-hovered-light active:text-button-active-light
      text-[15px] md:text-[32px]
      cursor-pointer
    ">
      <FormattedMessage id={messageId} />
    </Link>
  )
}

export default NavigationButton
