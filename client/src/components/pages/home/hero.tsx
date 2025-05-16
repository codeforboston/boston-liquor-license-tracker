import "./hero.css";
import logo from "@/assets/logo.svg";

const Hero = () => {
  return (
    <div className="hero flex flex-col md:items-start md:justify-start w-full sm:w-screen pl-3 pr-3 pt-[100px] pb-[70px] lg:mt-[64px] md:pt-[200px] md:pb-[144px] md:pl-[64px] gap-[24px]">
      <img src={logo} className="w-2xl lg:w-5xl" alt="Logo" />
      <h2 className="text-white text-2xl md:text-3xl lg:text-5xl w-full font-bold">
        Navigating the Liquor License system in Boston is hard. <br /> We are
        here to make it just a little bit easier.
      </h2>
      <p className="text-white text-xs md:text-base">
        Photo by{" "}
        <a href="https://unsplash.com/@quinguyen?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
          QUI NGUYEN
        </a>{" "}
        on{" "}
        <a href="https://unsplash.com/photos/turned-on-filament-bulb-lights-at-bar-counter-Zrp9b3PMIy8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
          Unsplash
        </a>
      </p>
    </div>
  );
};

export default Hero;
