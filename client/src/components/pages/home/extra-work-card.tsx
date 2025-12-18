import { ExtraWork } from "@/data/extra-work-data";
import { useIntl } from "react-intl";
import styles from "./extra-work-card.module.css";

interface ExtraWorkCardProps {
  item: ExtraWork;
}

const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  const intl = useIntl();
  return (
    <a
      href={item.href}
      target="_blank"
      style={{ backgroundImage: `url(${item.imgSrc})` }}
      title={intl.formatMessage({ id: item.alt })}
      className={`
        ${styles[item.name]}
        flex
        relative
        items-end
        shrink-0
        w-full
        size-full
        md:size-[320px]
        min-h-[96px]

        py-[12px] px-[16px] md:py-[16px]
        
        rounded-[8px]
        
        bg-cover
        bg-center
        bg-no-repeat
        
        cursor-pointer
        
        focus-visible:border-border-gray
        focus-visible:ring-border-gray
        focus-visible:ring-[8px]

        text-[14px]
        md:text-[32px]
        text-shadow-lg
        font-medium

        ${item.colorTheme === "light" ? 
          // Light theme
          "bg-background-light text-font-dark" 
          : 
          // Dark theme
          "bg-background-dark text-font-light"
        }
      `}
    >
      {item.title}
    </a>
  );
};

export default ExtraWorkCard;
