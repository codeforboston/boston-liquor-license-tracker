import styles from "./footer.module.css";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "@tanstack/react-router";

import logoDefault from "@/assets/logo.svg"

const Footer = () => {
  const links = {
    blb: "https://www.boston.gov/departments/licensing-board",
    abcc: "https://www.mass.gov/orgs/alcoholic-beverages-control-commission",
    application: "https://www.mass.gov/apply-for-an-alcoholic-beverages-license-abcc",
    analyze: "https://data.boston.gov/",
    offsite: "https://www.getoffsite.com/",
    bootcamp: "https://www.getoffsite.com/bootcamp",
    cod: "https://www.codeforboston.org"
  };

  const intl = useIntl();

  return (
    <footer className={styles.siteFooter} role="contentinfo">
      <section className={styles.footerLeft}>
        <img
              className={styles.logoImage}
              src={logoDefault}
              alt={intl.formatMessage({ id: "header.logo-altText" })}
        />
        <h4 className={styles.disclaimerTitle}>
          <FormattedMessage id="footer.disclaimerTitle" />
        </h4>
        <p className={styles.disclaimerText}>
          <FormattedMessage id="footer.disclaimerText" />
        </p>
      </section>

      <nav className={styles.footerColumns} aria-label="Footer Navigation">
        <section className={styles.footerSection}>
          <h4 className={styles.footerHeading}>
            <FormattedMessage id="footer.siteMap" />
          </h4>
          <ul>
            <li><Link to="/"><FormattedMessage id="footer.homepage" /></Link></li>
            <li><Link to="/maps"><FormattedMessage id="footer.map" /></Link></li>
            <li><Link to="/database"><FormattedMessage id="footer.database" /></Link></li>
            <li><Link to="/resources"><FormattedMessage id="footer.resources" /></Link></li>
          </ul>
        </section>

        <section className={styles.footerSection}>
          <h4 className={styles.footerHeading}>
            <FormattedMessage id="footer.importantLinks" />
          </h4>
          <ul>
            <li>
              <a href={links.blb} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.bostonBoard" />
              </a>
            </li>
            <li>
              <a href={links.abcc} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.abcc" />
              </a>
            </li>
            <li>
              <a href={links.application} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.application" />
              </a>
            </li>
            <li>
              <a href={links.analyze} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.analyzeBoston" />
              </a>
            </li>
          </ul>
        </section>

        <section className={styles.footerSection}>
          <h4 className={styles.footerHeading}>
            <FormattedMessage id="footer.moreFromUs" />
          </h4>
          <ul>
            <li>
              <a href={links.offsite} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.offsite" />
              </a>
            </li>
            <li>
              <a href={links.bootcamp} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.bootcamp" />
              </a>
            </li>
            <li>
              <a href={links.cod} target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="footer.codeForBoston" />
              </a>
            </li>
          </ul>
        </section>
      </nav>       

      <section className={styles.footerBottom}>
        <p className={styles.footerNote}>
          <FormattedMessage id="footer.builtBy" />
        </p>
        <p className={styles.footerCopyright}>
          <FormattedMessage id="footer.copyright" />
        </p>
      </section>
    </footer>
  );
};

export default Footer;
