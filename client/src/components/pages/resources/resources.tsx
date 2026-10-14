import { useIntl } from "react-intl";
import Header from "./header";
import Links from "./links";
import BasicResources from "./basic-resources";
import Agencies from "./agencies";
import styles from "./resources.module.css";
import { ApplicationResourcesAndGuides } from "./application-guides";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;

  return (
    <main>
      <title>{title}</title>
      <Header />
      <div className={`${styles.resources} flex flex-col gap-[24px]`}>
        <BasicResources />
        <Agencies />
        <ApplicationResourcesAndGuides />
        <Links />
      </div>
    </main>
  );
};

export default Resources;