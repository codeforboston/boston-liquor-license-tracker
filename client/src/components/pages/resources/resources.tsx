import "./resources.module.css";
import { useIntl } from "react-intl";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className="resourcesPage">
      <title>{title}</title>
      <h1>Resources</h1>
      <p>This is the Resources page.</p>
    </main>
  );
};

export default Resources;
