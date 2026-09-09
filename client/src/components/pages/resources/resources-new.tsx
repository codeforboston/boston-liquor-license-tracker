// New resources page being refactored (in progress.)
import { useIntl } from "react-intl";
import Header from "./header";

const ResourcesNew = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;

  return (
    <main>
      <title>{title}</title>
      <Header />
    </main>
  );
};

export default ResourcesNew;