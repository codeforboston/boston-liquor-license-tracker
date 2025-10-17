import "./hero.css";
import logo from "@/assets/logo.svg";
import { FormattedMessage, useIntl } from "react-intl";

const Hero = () => {
  const intl = useIntl();
  return (
    <div
      className="hero flex flex-col md:items-start md:justify-start w-full w-full pl-3 pr-3  pb-[70px]  md:pt-[200px] md:pb-[144px] md:pl-[64px] gap-[24px]"
      title={intl.formatMessage({ id: "home.hero.title" })}
    >
      <img
        src={logo}
        className="w-2xl lg:w-5xl"
        alt={intl.formatMessage({ id: "header.logo-altText" })}
      />
      <h2 className="text-white text-2xl md:text-3xl lg:text-5xl w-full font-bold">
        <FormattedMessage
          id="home.hero.heading"
          values={{
            br: <br />,
          }}
        />
      </h2>
      <p className="text-white text-xs md:text-base">
        <FormattedMessage
          id="home.hero.photoCredit"
          values={{
            photographerLink: (
              <a href="https://unsplash.com/@quinguyen?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                QUI NGUYEN
              </a>
            ),
            platformLink: (
              <a href="https://unsplash.com/photos/turned-on-filament-bulb-lights-at-bar-counter-Zrp9b3PMIy8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Unsplash
              </a>
            ),
          }}
        />
      </p>
    </div>
  );
};

export default Hero;
