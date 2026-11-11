import { FormattedMessage } from "react-intl";
import ResourceButton from "@components/pages/resources/resource-button.tsx";

interface GuideButton {
  labelId: string;
  href: string;
  icon: "link" | "video";
}

interface Guide {
  titleId: string;
  descriptionId: string;
  buttons: GuideButton[];
}

const guides: Guide[] = [
  {
    titleId: "resources.applicationguides.cityGuides.title",
    descriptionId: "resources.applicationguides.cityGuides.description",
    buttons: [
      {
        labelId: "resources.applicationguides.blbGuideButton.website",
        href: "https://www.boston.gov/departments/licensing-board/apply-alcoholic-beverages-retail-license",
        icon: "link",
      },
      {
        labelId: "resources.applicationguides.blbGuideButton.video",
        href: "https://youtu.be/tU-u8-ii1R4?si=-KuGFiMzrtUeCNYP",
        icon: "video",
      },
    ],
  },
  {
    titleId: "resources.applicationguides.offsiteGuide.title",
    descriptionId: "resources.applicationguides.offsiteGuide.description",
    buttons: [
      {
        labelId: "resources.applicationguides.offsiteGuide.website",
        href: "https://docs.google.com/document/d/1lgNSyEYcxv2vo_5Oln4ZFy7RuHcDAOcsbsMSA-3FD9A/edit?usp=sharing",
        icon: "link",
      },
    ],
  },
  {
    titleId: "resources.applicationguides.toast.title",
    descriptionId: "resources.applicationguides.toast.text",
    buttons: [
      {
        labelId: "resources.applicationguides.toast.website",
        href: "https://pos.toasttab.com/blog/on-the-line/how-to-get-a-liquor-license-in-massachusetts?srsltid=AfmBOopAp9ZVROi0VflQVOoNoVkEuouXLzdwWoKQTQztr6FSF2Vy6Zef",
        icon: "link",
      },
    ],
  },
];

export function ApplicationResourcesAndGuides() {
  return (
    <section
      aria-labelledby="application-guides-heading"
      className="flex flex-col gap-[24px]"
    >
      <header className="flex flex-col gap-[8px]">
        <h2 id="application-guides-heading">
          <FormattedMessage id="resources.applicationguides.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.applicationguides.description" />
        </p>
      </header>
      {guides.map((guide) => (
        <article key={guide.titleId} className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-[8px]">
            <h3>
              <FormattedMessage id={guide.titleId} />
            </h3>
            <p>
              <FormattedMessage id={guide.descriptionId} />
            </p>
          </div>
          <div className="flex flex-col gap-[12px] md:gap-[16px]">
            {guide.buttons.map((button) => (
              <ResourceButton key={button.labelId} {...button} />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
