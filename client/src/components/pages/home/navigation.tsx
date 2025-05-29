import './navigation.css';
import { Link } from "@tanstack/react-router";


const Navigation = () => {
  return (
    <div className="navigation">
      <Link to="/maps">
        <button>MAPS</button>
      </Link>
      <Link to="/database">
        <button>LICENSE DATABASE</button>
      </Link>
      <Link to="/resources">
        <button>LICENSE RESOURCES</button>
      </Link>
    </div>
  );
};

export default Navigation
