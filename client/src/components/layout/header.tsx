import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "@/components/layout/header.css";
import { FormattedMessage } from "react-intl";
import LangSwitcher from "@/i18n/lang-switcher";
import language from "@/assets/language.svg";
import logoDefault from "@/assets/logo.svg";
import logoHover from "@/assets/logo_hover.svg";
import logoPressed from "@/assets/logo_pressed.svg";


const Spacer = () => {
  return <span className="mx-4 text-gray-400">&bull;</span>;
};

const LineSpacer = () => {
  return <div className="w-[160px] h-px bg-gray-300 mx-4" />;
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleLogoClick = () => setLogoClicked(true);

  
 const logoSrc = isHovered
  ? logoHover
  : logoClicked
  ? logoPressed
  : logoDefault;

  return (
    <header className="site-header bg shadow-md sticky top-0 left-0 w-full z-50">
      <div className="flex max-w-7xl sm:px-[24px] py-[18px] md:p-6 lg:items-center text-center">
        <nav className="flex w-full items-center">
          <Link
            to="/"
            className="text-xl font-bold"
            onClick={handleLogoClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              className="logoImage"
              src={logoSrc}
              alt="Logo"
            />
          </Link>
        
          <div className="hidden md:flex items-center w-full">
            <Spacer />
            <Link to="/maps">
             <FormattedMessage id="header.maps" />
            </Link>
           <Spacer />
            <Link to="/database">
             <FormattedMessage id="header.database" />
            </Link>
            <Spacer />
            <Link to="/resources">
              <FormattedMessage id="header.resources" />
            </Link>
          
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
            <img
              src={language}
             className="language-icon inline-block m-0"
             alt="Language"
            />
            <LangSwitcher />
            </div>
          </div>
          <div className="flex md:hidden ml-auto">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            <span className="justify-end  material-icons">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
          </div> 
        </nav>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden px-4  bg-[#2e2e2e]">
          <Link to="/maps" className="py-[8px] px-[24px] block hover:text-blue-500">
            <FormattedMessage id="header.maps" />
          </Link>
          <LineSpacer />
          <Link to="/database" className="py-[8px] px-[24px] block hover:text-blue-500">
            <FormattedMessage id="header.database" />
          </Link>
          <LineSpacer />
          <Link to="/resources" className="py-[8px] px-[24px] block hover:text-blue-500">
            <FormattedMessage id="header.resources" />
          </Link>
          <div className="py-[16px] px-[24px] pb-[8px] ms-auto">
          <img
            src={language}
            className="language-icon inline-block me-2"
            alt="Language"
          />
          <LangSwitcher />
          </div>
        
        </nav>
      )}
    </header>
  );
};

export default Header;
