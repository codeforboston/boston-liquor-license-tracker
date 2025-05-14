import "./hero.css";
import logo from "@/assets/logo.svg";

const Hero = () => {
  return (
    <div className="hero w-screen mt-[64px] pt-[200px] pb-[144px] pl-[64px] gap-[24px]">
      <img src={logo} className="w-5xl" />
      <h2 className="text-white text-5xl min-w-min whitespace-nowrap">
        Navigating the Liquor License system in Boston is hard. <br /> We are
        here to make it just a little bit easier
      </h2>
    </div>
  );
};

export default Hero;
