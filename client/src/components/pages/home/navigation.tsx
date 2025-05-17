import './navigation.css';
import { Link } from "@tanstack/react-router";


const Navigation = () => {
  return (
    <div className="navigation">
      <Link to="/maps">
        <button className="button-css">MAPS</button>
      </Link>
      <Link to="/database">
        <button className="button-css">LICENSE DATABASE</button>
      </Link>
      <Link to="/resources">
        <button className="button-css">LICENSE RESOURCES</button>
      </Link>
    </div>
  );
};

export default Navigation
