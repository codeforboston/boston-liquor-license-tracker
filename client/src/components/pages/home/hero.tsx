import styles from  "./hero.module.css";
import logo from "@/assets/logo.svg";
import { FormattedMessage, useIntl } from "react-intl";

const Hero = () => {
  const intl = useIntl();
  return (
    <div
      className={`${styles.hero} flex flex-col md:items-start md:justify-start w-full gap-[8px] md:gap-[24px]`}
      title={intl.formatMessage({ id: "home.hero.title" })}
    >
      <img
        src={logo}
        className="w-3xs md:w-4xl lg:w-5xl"
        alt={intl.formatMessage({ id: "header.logo-altText" })}
      />
      <h2 className={styles.homepageDisplay}>
        <FormattedMessage
          id="home.hero.heading"
        />
      </h2>
      <p>
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
