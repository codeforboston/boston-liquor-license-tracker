import * as React from "react";
import { Link } from "@tanstack/react-router";
import "./back-to-home.css";

function BackToHome() {
    return <Link to="/">
        <button className="back-to-home">BACK TO HOME</button>
    </Link>
}

export default BackToHome;