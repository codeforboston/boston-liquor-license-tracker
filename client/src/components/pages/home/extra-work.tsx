import ExtraWorkCard from "./extra-work-card";
import "./extra-work.module.css";
import { extraWorkData } from "@/data/extra-work-data";

const ExtraWork = () => {
	return (
		<div className="extra-work p-[32px] overflow-x-scroll">
			<h2 className="text-2xl font-bold">Check out more of our work!</h2>
			<div className="flex w-full pt-[16px] gap-x-[64px]">
				{extraWorkData.map((item, index) => (
					<ExtraWorkCard key={index} item={item}/>
				))}
			</div>
		</div>
	);
};

export default ExtraWork;
