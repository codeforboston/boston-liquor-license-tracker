import './navigation.css';
import { Link } from "@tanstack/react-router";
import { FormattedMessage } from "react-intl";

const Navigation = () => {
  return (
    <div className="navigation">
      <Link to="/maps">
        <button>
          <FormattedMessage id="navigation.maps" />
        </button>
      </Link>
      <Link to="/database">
        <button>
          <FormattedMessage id="navigation.database" />
        </button>
      </Link>
      <Link to="/resources">
        <button className="button-css">
          <FormattedMessage id="navigation.resources" />
        </button>
      </Link>
    </div>
  );
};

export default Navigation
