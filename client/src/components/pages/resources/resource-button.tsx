import { FormattedMessage } from "react-intl";
import { Link, SquarePlay } from "lucide-react";

interface ResourceButtonProps {
  labelId: string;
  href: string;
  icon: "link" | "video"
}

const ICONS = { link: Link, video: SquarePlay};

const ResourceButton = ({ labelId, href, icon }: ResourceButtonProps) => {
  const Icon = ICONS[icon]
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="
      flex
      justify-center
      items-center
      text-center
      w-full md:flex-1 md:max-w-[400px]
      min-h-[34px] md:min-h-[62px]
      px-[24px] py-[8px] md:py-[12px]
      rounded-[8px]
      bg-button-default-dark hover:bg-button-hovered-dark active:bg-button-active-dark
      text-button-default-light hover:text-button-hovered-light active:text-button-active-light
      text-[15px] md:text-[32px]
      cursor-pointer
    ">
      <FormattedMessage id={labelId} />
      <Icon aria-hidden="true"/>
    </a>
  )
}

export default ResourceButton