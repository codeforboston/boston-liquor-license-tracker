import { FormattedMessage } from "react-intl";
import { Link, SquarePlay } from "lucide-react";
import styles from "./resources.module.css";

interface ResourceButtonProps {
  labelId: string;
  href: string;
  icon: "link" | "video"
}

const ICONS = { link: Link, video: SquarePlay};

const ResourceButton = ({ labelId, href, icon }: ResourceButtonProps) => {
  const Icon = ICONS[icon]
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.resourceButton}>
      <FormattedMessage id={labelId} />
      <Icon aria-hidden="true"/>
    </a>
  )
}

export default ResourceButton
