import styles from  "./hero.module.css";
import logo from "@/assets/logo.svg";
import { FormattedMessage, useIntl } from "react-intl";

const Hero = () => {
  const intl = useIntl();
  return (
    <div
      className={`${styles.hero} md:items-start md:justify-start w-full`}
      title={intl.formatMessage({ id: "home.hero.title" })}
    >
      <div className={styles.heroInner}>
      <img
        src={logo}
        className="w-full max-w-[80%] md:max-w-[852px]"
        alt={intl.formatMessage({ id: "header.logo-altText" })}
      />
      <h2 className={`${styles.homepageDisplay} max-w-[840px]`}>
        <FormattedMessage
          id="home.hero.heading"
        />
      </h2>
      <p className={styles.photoCredit}>
        <FormattedMessage
          id="home.hero.photoCredit"
          values={{
            photographerLink: (
              <a href="https://unsplash.com/@louishansel?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">
                Louis Hansel
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
      <div/> {/* spacer */}
    </div>
  );
};

export default Hero;
