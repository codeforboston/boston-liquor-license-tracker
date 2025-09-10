import { FormattedMessage } from "react-intl";
import { extraWorkData } from "@/data/extra-work-data";
import ExtraWorkCard from "./extra-work-card";

const ExtraWork = () => {
  return (
    <div className="extra-work pt-[10px] sm:p-[32px]">
      <h2 className="text-2xl font-bold text-center">
        <FormattedMessage id="home.extra-work.h2" />
      </h2>
      <div className="flex flex-col justify-center items-center lg:flex-row lg:flex-wrap lg:justify-start w-full pt-[16px] gap-[64px]">
        {extraWorkData.map((item, index) => (
          <ExtraWorkCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default ExtraWork;
