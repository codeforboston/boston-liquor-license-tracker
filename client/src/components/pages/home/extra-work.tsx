import { FormattedMessage } from "react-intl";
import { extraWorkData } from "@/data/extra-work-data";
import ExtraWorkCard from "./extra-work-card";

const ExtraWork = () => {
	return (
		<div className="extra-work p-[32px] overflow-x-scroll">
			<h2 className="text-2xl font-bold">
            <FormattedMessage id="home.extra-work.h2" />
         </h2>
			<div className="flex w-full pt-[16px] gap-x-[64px]">
				{extraWorkData.map((item, index) => (
					<ExtraWorkCard key={index} item={item}/>
				))}
			</div>
		</div>
	);
};

export default ExtraWork;
