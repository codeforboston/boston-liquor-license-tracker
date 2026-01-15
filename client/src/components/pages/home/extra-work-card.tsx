import { ExtraWork } from "@/data/extra-work-data";
import styles from "./extra-work-card.module.css";

interface ExtraWorkCardProps {
  item: ExtraWork;
}

const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  return (
    <a
      href={item.href}
      target="_blank"
      style={{ backgroundImage: `${item.name === "bootcamp" ? "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))," : ""} url(${item.imgSrc})` }}
      title={item.title}
      className={`
        ${styles.extraWorkCard}
        ${styles[item.name]}
        text-shadow-lg
        focus-visible:border-border-gray
        focus-visible:ring-border-gray
        focus-visible:ring-[8px]
      `}
    >
      {item.title}
    </a>
  );
};

export default ExtraWorkCard;
