import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import logo from "../assets/logo.svg";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}

function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg shadow-md fixed top-0 left-0 w-full z-50">
      <div className=" max-w-7xl p-4 sm:p-6 lg:p-8 flex items-center">
        {/* Desktop Links */}
        <nav className="hidden md:flex items-center">
          <Link
            to="/"
            search={{ section: "home" }}
            className="text-xl font-bold text-blue-600"
          >
            <img className="logoImage" src={logo} alt="Logo" />
          </Link>
          <span className="mx-4 text-gray-400">•</span>
          {[
            { label: "MAPS", section: "maps" },
            { label: "LICENSE DATABASE", section: "database" },
            { label: "LICENSE RESOURCES", section: "resources" },
          ].map((item, index, arr) => (
            <React.Fragment key={item.label}>
              <Link
                to="/"
                search={{ section: item.section }}
                className="hover:text-blue-500"
              >
                {item.label}
              </Link>
              {index < arr.length - 1 && (
                <span className="mx-4 text-gray-400">•</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-2 bg-white">
          <a href="#home" className="block hover:text-blue-500">
            Home
          </a>
          <a href="#about" className="block hover:text-blue-500">
            About
          </a>
          <a href="#services" className="block hover:text-blue-500">
            Services
          </a>
          <a href="#contact" className="block hover:text-blue-500">
            Contact
          </a>
        </nav>
      )}
    </header>
  );
}

export default Header;
