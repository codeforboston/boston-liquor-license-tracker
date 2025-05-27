import * as React from "react";
import { Link } from "@tanstack/react-router";

// import { Button } from "./button";

const styles = {
    button: {
        backgroundColor: "#fff",
        outline: "1px solid black",
        borderRadius: "4px",
        padding: "8px 24px",
        fontWeight: "700",
        margin: "24px"
    }
}

function BackToHome() {
    return <Link to="/">
        <button style={styles.button}>BACK TO HOME</button>
        </Link>
}

export default BackToHome;