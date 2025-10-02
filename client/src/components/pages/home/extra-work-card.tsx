import { ExtraWork } from "@/data/extra-work-data";
import { useIntl } from "react-intl";

interface ExtraWorkCardProps {
  item: ExtraWork;
}

const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  const intl = useIntl();
  return (
    <div className="shrink-0 size-[320px] rounded-[9px] bg-black  ">
      <a
        href={item.href}
        target="_blank"
        className={`
                  flex
                  items-end
                  size-full
                  p-[16px]
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
          className={`text-[24px] text-shadow-lg font-semibold ${item.textColor === "light" ? "text-black" : "text-[var(--font-color-light)]"}`}
        >
          {item.title}
        </p>
      </a>
    </div>
  );
};

export default ExtraWorkCard;
