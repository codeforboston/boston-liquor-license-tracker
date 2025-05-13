import { useState } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.svg";
import '@/components/layout/header.css';

const Spacer = () => {
  return <span className="mx-4 text-gray-400">&bull;</span>
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg shadow-md fixed top-0 left-0 w-full z-50">
      <div className=" max-w-7xl p-4 sm:p-6 lg:p-8 flex items-center">
        {/* Desktop Links */}
        <nav className="hidden md:flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            <img className="logoImage" src={logo} alt="Logo" />
          </Link>
          <Spacer />
          <Link to="/maps" className="hover:text-blue-500">MAPS</Link>
          <Spacer />
          <Link to="/database" className="hover:text-blue-500">LICENSE DATABASE</Link>
          <Spacer />
          <Link to="/resources" className="hover:text-blue-500">LICENSE RESOURCES</Link>
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
          <Link to="/" className="block hover:text-blue-500">
            Home
          </Link>
          {/*
          Routes for these links do not exist yet

          <Link to="/about" className="block hover:text-blue-500">
            About
          </Link>
          <Link to="/services" className="block hover:text-blue-500">
            Services
          </Link>
          <Link to="/contact" className="block hover:text-blue-500">
            Contact
          </Link>
         */}
        </nav>
      )}
    </header>
  )
}

export default Header
