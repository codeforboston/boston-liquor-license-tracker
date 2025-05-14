import "./hero.css";
import logo from "@/assets/logo.svg";

const Hero = () => {
  return (
    <div className="hero flex flex-col md:items-start md:justify-start w-full sm:w-screen pl-3 pr-3 pt-[100px] pb-[70px] lg:mt-[64px] md:pt-[200px] md:pb-[144px] md:pl-[64px] gap-[24px]">
      <img src={logo} className="w-2xl lg:w-5xl" />
      <h2 className="text-white text-2xl md:text-3xl lg:text-5xl w-full font-bold">
        Navigating the Liquor License system in Boston is hard. <br /> We are
        here to make it just a little bit easier.
      </h2>
    </div>
  );
};

export default Hero;
