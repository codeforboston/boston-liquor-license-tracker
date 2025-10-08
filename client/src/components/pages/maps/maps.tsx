import { useIntl } from "react-intl";
import "./maps.module.css";

const Maps = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "map.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className="mapsPage">
      <title>{title}</title>
      <h1>Maps</h1>
      <p>This is the Maps page.</p>
    </main>
  );
};

export default Maps;
