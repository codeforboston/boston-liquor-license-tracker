import ResourceButton from "./resource-button";
import styles from "./resources.module.css";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";

const Resources = () => {
  const intl = useIntl();
  const title = `${intl.formatMessage({ id: "resources.pageTitle" })} | ${intl.formatMessage({ id: "home.pageTitle" })}`;
  return (
    <main className={`${styles.resources} flex flex-col gap-[24px]`}>
      <title>{title}</title>
      <div className="flex flex-col gap-[8px]">
        <h1>
          <FormattedMessage id="resources.title" />
        </h1>
        <p>
          <FormattedMessage id="resources.text"/>
        </p>
      </div>
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.cityGuides.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.cityGuides.text"/>
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.blbGuideButton.website"
          href="https://www.boston.gov/departments/licensing-board/apply-alcoholic-beverages-retail-license"
          icon="link"
        />
        <ResourceButton
          labelId="resources.blbGuideButton.video"
          href="https://youtu.be/tU-u8-ii1R4?si=-KuGFiMzrtUeCNYP"
          icon="video"
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.offsiteGuide.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.offsiteGuide.text"/>
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.offsiteGuide.website"
          href="https://docs.google.com/document/d/1lgNSyEYcxv2vo_5Oln4ZFy7RuHcDAOcsbsMSA-3FD9A/edit?usp=sharing"
          icon="link"
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <h2>
          <FormattedMessage id="resources.toast.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.toast.text"/>
        </p>
      </div>
      <div className="flex flex-col gap-[16px]">
        <ResourceButton
          labelId="resources.toast.website"
          href="https://pos.toasttab.com/blog/on-the-line/how-to-get-a-liquor-license-in-massachusetts?srsltid=AfmBOopAp9ZVROi0VflQVOoNoVkEuouXLzdwWoKQTQztr6FSF2Vy6Zef"
          icon="link"
        />
      </div>
    </main>
  );
};

export default Resources;
