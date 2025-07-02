import { Link } from "@tanstack/react-router"
import { FormattedMessage } from "react-intl"

interface HeaderLinkProps {
    to: string
    messageId: string
    isMobile?: boolean
}

const HeaderLink = ({to, messageId, isMobile=false}: HeaderLinkProps) => {
    return (
        <Link to={to} className={`
            hover:text-[#CCCCCC] 
            active:text-[#999999] 
            ${isMobile && "py-[8px] px-[24px] block"}`} >
            <FormattedMessage id={messageId} />
        </Link>
    )
}

export default HeaderLink
