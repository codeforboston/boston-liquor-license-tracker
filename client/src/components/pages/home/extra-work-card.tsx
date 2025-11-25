import { ExtraWork } from "@/data/extra-work-data";
import { useIntl } from "react-intl";

interface ExtraWorkCardProps {
  item: ExtraWork;
}

const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  const intl = useIntl();
  return (
    <div className="shrink-0 w-full md:size-[320px] rounded-[9px] bg-background-dark  ">
      <a
        href={item.href}
        target="_blank"
        className={`
                  flex
                  items-end
                  size-full
                  min-h-[96px]
                  py-[12px] px-[16px] md:py-[16px]
                  rounded-[8px]
                  bg-cover
                  bg-center
                  bg-no-repeat
                  cursor-pointer
                  hover:opacity-90
                  active:opacity-70
              `}
        style={{ backgroundImage: `url(${item.imgSrc})` }}
        title={intl.formatMessage({ id: item.alt })}
      >
        <p
          className={`text-[14px] md:text-[32px] text-shadow-lg font-medium ${item.textColor === "light" ? "text-font-dark" : "text-font-light"}`}
        >
          {item.title}
        </p>
      </a>
    </div>
  );
};

export default ExtraWorkCard;
