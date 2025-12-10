import { useState } from "react";
import { Link } from "@tanstack/react-router";
import styles from "@/components/layout/header.module.css";
import { FormattedMessage, useIntl } from "react-intl";
import LangSwitcher from "@/i18n/lang-switcher";
import language from "@/assets/language.svg";
import logoDefault from "@/assets/logo.svg";
import logoHover from "@/assets/logo_hover.svg";
import logoPressed from "@/assets/logo_pressed.svg";

const Spacer = () => <span className="mx-4">&bull;</span>;

const LineSpacer = () => <div className="w-[160px] h-px bg-background-light" />;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false); // Hamburger Menu isOpen
  const [logoSrc, setLogoSrc] = useState(logoDefault); // Logo isHovered

  const toggleMenu = () => setIsOpen(!isOpen); // Hamburger Menu Toggle
  const handleMouseEnter = () => setLogoSrc(logoHover) // Logo Hover
  const handleMouseLeave = () => setLogoSrc(logoDefault); // Logo Default
  const handleMouseDown = () => setLogoSrc(logoPressed) // Logo Click
  const handleMouseUp = () => setLogoSrc(logoHover) // Logo Click Release

  const intl = useIntl();

  return (
    <header
      className={`${styles.siteHeader} bg-button-default-dark shadow-md sticky top-0 left-0 w-full z-50`}
    >
      <section className="flex">
        <Link
          to="/"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex items-center"
        >
          <img
            className={styles.logoImage}
            src={logoSrc}
            alt={intl.formatMessage({ id: "header.logo-altText" })}
          />
        </Link>

        {/* Non-mobile Nav & Language Switcher */}
        <nav className="hidden md:flex items-center text-center w-full">
          <Spacer />
          <Link to="/maps">
            <FormattedMessage id="shared.map.capitalized" />
          </Link>
          <Spacer />
          <Link to="/database">
            <FormattedMessage id="shared.database.capitalized" />
          </Link>
          <Spacer />
          <Link to="/resources">
            <FormattedMessage id="shared.resources.capitalized" />
          </Link>

          <div className="flex ml-auto pl-1 mr-5 items-center">
            <img
              src={language}
              className={"inline-block size-[20px] text-font-light"}
              alt={intl.formatMessage({ id: "header.language" })}
            />
            <LangSwitcher />
          </div>
        </nav>

        {/* Hamburger Toggle */}
        <button className="flex md:hidden ml-auto" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="justify-end material-icons">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </section>

      {/* Mobile Nav & Language Switcher*/}
      {isOpen && (
        <nav className="md:hidden bg-background-dark mt-4">
          <Link to="/maps" className="py-[8px] block">
            <FormattedMessage id="shared.map.capitalized" />
          </Link>
          <LineSpacer />
          <Link to="/database" className="py-[8px] block">
            <FormattedMessage id="shared.database.capitalized" />
          </Link>
          <LineSpacer />
          <Link to="/resources" className="py-[8px] block">
            <FormattedMessage id="shared.resources.capitalized" />
          </Link>
          <div className="pt-[16px] text-xs ms-auto">
            <img
              src={language}
              className={"inline-block size-[20px] text-font-light me-2"}
              alt={intl.formatMessage({ id: "header.language" })}
            />
            <LangSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
