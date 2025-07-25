import styles from "./footer.module.css";
import { FormattedMessage } from "react-intl";
import { Link } from "@tanstack/react-router";

const Footer = () => {
  const links = {
    cod: "https://www.codeforboston.org"
  };

  return (
    <footer className={styles.siteFooter} role="contentinfo">
      <div className={styles.footerContainer}>
        <section className={styles.footerLeft}>
          <div className={styles.licenseHeader}>
            <span className={styles.licenseBadge}>
              <FormattedMessage id="footer.license" />
            </span>
            <span className={styles.licenseTitle}>
              <FormattedMessage id="footer.toSucceed" />
            </span>
          </div>

          <p className={styles.disclaimerTitle}>
            <FormattedMessage id="footer.disclaimerTitle" />
          </p>
          <p className={styles.disclaimerText}>
            <FormattedMessage id="footer.disclaimerText" />
          </p>

          <p className={styles.footerNote}>
            <FormattedMessage id="footer.builtBy" />
            <br />
            <FormattedMessage id="footer.copyright" />
          </p>
        </section>

        <nav className={styles.footerColumns} aria-label="Footer Navigation">
          <section className={styles.footerSection}>
            <h3 className={styles.footerHeading}>
              <FormattedMessage id="footer.siteMap" />
            </h3>
            <ul>
              <li><Link to="/"><FormattedMessage id="footer.homepage" /></Link></li>
              <li><Link to="/maps"><FormattedMessage id="footer.map" /></Link></li>
              <li><Link to="/database"><FormattedMessage id="footer.database" /></Link></li>
              <li><Link to="/resources"><FormattedMessage id="footer.resources" /></Link></li>
            </ul>
          </section>

          <section className={styles.footerSection}>
            <h3 className={styles.footerHeading}>
              <FormattedMessage id="footer.importantLinks" />
            </h3>
            <ul>
              <li><Link to="/"><FormattedMessage id="footer.bostonBoard" /></Link></li>
              <li><Link to="/"><FormattedMessage id="footer.abcc" /></Link></li>
              <li><Link to="/"><FormattedMessage id="footer.application" /></Link></li>
              <li><Link to="/"><FormattedMessage id="footer.analyzeBoston" /></Link></li>
            </ul>
          </section>

          <section className={styles.footerSection}>
            <h3 className={styles.footerHeading}>
              <FormattedMessage id="footer.moreFromUs" />
            </h3>
            <ul>
              <li><Link to="/"><FormattedMessage id="footer.offsite" /></Link></li>
              <li><Link to="/"><FormattedMessage id="footer.bootcamp" /></Link></li>
              <li>
                <a href={links.cod} target="_blank" rel="noopener noreferrer">
                  <FormattedMessage id="footer.codeForBoston" />
                </a>
              </li>
            </ul>
          </section>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
