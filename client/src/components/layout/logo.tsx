import { useState } from "react";

import { Link } from "@tanstack/react-router";

import defaultLogo from "@/assets/Logo-Default.svg"
import hoverLogo from "@/assets/Logo-Hovered.svg"
import pressedLogo from "@/assets/Logo-Pressed.svg"


const Logo = () => {
    const [logoSrc, setLogoSrc] = useState<string>(defaultLogo)

    return (
        <Link
            to="/"
            className={`text-xl font-bold`}
          >
            <img
              className={`logoImage`}
              src={logoSrc}
              alt="Logo"
              onMouseEnter={() => setLogoSrc(hoverLogo)}
              onMouseLeave={() => setLogoSrc(defaultLogo)}
              onMouseDown={() => setLogoSrc(pressedLogo)}
            />
          </Link>
    )
}

export default Logo
