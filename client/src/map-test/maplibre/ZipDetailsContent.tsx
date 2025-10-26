import { Button } from "@/components/ui/button";
import { MapZipCodeData } from "./types";
import dataError from "../../assets/icons/data-error.svg";
import clipboards from "../../assets/icons/clipboards-question-mark.svg";

export const ZipDetailsContent = ({
  zipData,
}: {
  zipData?: MapZipCodeData;
}) => {
  if (!zipData) {
    return <ZipDetailsError />;
  }

  const { zipCode, data } = zipData;

  if (!data) {
    return <ZipDetailsEmpty zipCode={zipCode} />;
  }

  return <>{`${zipData}`}</>;
};

export const ZipDetailsError = () => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center text-center gap-[32px]">
      <img className="w-[90px] justify-self-center" src={dataError} />
      <h3 className="font-medium text-[18px] px-[10px]">
        Whoops! There was an error loading the data, please reload or try again
        later
      </h3>
      <Button onClick={() => window.location.reload()}>Refresh Page</Button>
    </div>
  );
};

export const ZipDetailsEmpty = ({ zipCode }: { zipCode: string }) => {
  return (
    <div className="flex flex-col h-full w-full font-medium text-[18px]">
      <h2 className="text-2xl font-bold mb-[8px]">{zipCode}</h2>
      <hr />
      <div className="items-center text-center h-[stretch] content-center px-[32px]">
        <h3>Sorry! It appears we don't have data for this zip code</h3>
        <img
          className="w-[90px] justify-self-center m-[32px]"
          src={clipboards}
        />
        <h3 className="mb-[32px]">Check back later or try another Zip Code</h3>
      </div>
    </div>
  );
};
