import { FormattedMessage } from "react-intl";
import { Link, SquarePlay } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceButtonProps {
  labelId: string;
  href: string;
  icon: "link" | "video"
}

const ICONS = { link: Link, video: SquarePlay };

const ResourceButton = ({ labelId, href, icon }: ResourceButtonProps) => {
  const Icon = ICONS[icon]
  return (
    // max-w-full: long labels wrap instead of overflowing on narrow screens.
    // Single-line buttons stay 34px tall (7 + 20 + 7).
    <Button asChild className="flex w-fit min-w-[280px] max-w-full">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <FormattedMessage id={labelId} />
        <Icon aria-hidden="true" />
      </a>
    </Button>
  )
}

export default ResourceButton
