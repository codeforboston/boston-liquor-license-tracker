import { FormattedMessage } from "react-intl";
import { extraWorkData } from "@/data/extra-work-data";
import ExtraWorkCard from "./extra-work-card";

const ExtraWork = () => {
  return (
    <div className="extra-work px-[24px] lg:px-[64px] py-[24px] lg:py-[32px]">
      <h2 className="text-center lg:text-start">
        <FormattedMessage id="home.extraWork.title" />
      </h2>
      <nav className="flex flex-col justify-center items-center lg:flex-row lg:flex-wrap lg:justify-start w-full pt-[8px] lg:pt-[16px] gap-[16px] lg:gap-[64px]">
        {extraWorkData.map((item, index) => (
          <ExtraWorkCard key={index} item={item} />
        ))}
      </nav>
    </div>
  );
};

export default ExtraWork;
