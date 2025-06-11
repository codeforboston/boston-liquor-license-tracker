import { Link } from "@tanstack/react-router";
import { FormattedMessage } from "react-intl";
import "./back-to-home.css";

function BackToHome() {
    return <Link to="/">
        <button className="back-to-home">
          <FormattedMessage
            id="ui.backToHomeButton"
          />
        </button>
    </Link>
}

export default BackToHome;
