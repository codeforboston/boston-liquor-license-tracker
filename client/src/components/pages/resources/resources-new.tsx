// New resources page being refactored (in progress.)
import { useIntl } from "react-intl";
import Header from "./header";
import BasicResources from "./basic-resources-new";
import Agencies from "./agencies-new";
import styles from "./resources-new.module.css";

const ResourcesNew = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;

  return (
    <main>
      <title>{title}</title>
      <Header />
      <div className={`${styles.resources} flex flex-col gap-[24px]`}>
        <BasicResources />
        <Agencies />
      </div>
    </main>
  );
};

export default ResourcesNew;