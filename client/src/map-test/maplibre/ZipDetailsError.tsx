import { Button } from "@/components/ui/button";
import dataError from "../../assets/icons/data-error.svg";

export const ZipDetailsError = () => {
  return (
    <>
      <img className="w-[90px] justify-self-center" src={dataError} />
      <h3 className="font-medium text-[18px] px-[10px]">
        Whoops! There was an error loading the data, please reload or try again
        later
      </h3>
      <Button onClick={() => window.location.reload()}>Refresh Page</Button>
    </>
  );
};
