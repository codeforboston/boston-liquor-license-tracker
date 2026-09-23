
import {FormattedMessage} from "react-intl";
import ResourceButton from "@components/pages/resources/resource-button.tsx";
import styles from "./resources.module.css";

export function ApplicationResourcesAndGuides(){
    const titleAndBodyLayout: string = `flex flex-col gap-[8px]`
    const buttonLayout: string = `${styles.buttonGroup} flex flex-col gap-[12px] md:gap-[16px]`
    return(
        <div className="flex flex-col gap-[24px]">
            <div className={titleAndBodyLayout}>
                <h2>
                    <FormattedMessage id="resources.applicationguides.title" />
                </h2>
                <p>
                    <FormattedMessage id="resources.applicationguides.description" />
                </p>
            </div>
            <div className={titleAndBodyLayout}>
                <h3>
                    <FormattedMessage id="resources.applicationguides.cityGuides.title" />
                </h3>
                <p>
                    <FormattedMessage id="resources.applicationguides.cityGuides.description" />
                </p>
            </div>
            <div className={`${buttonLayout}`}>
                <ResourceButton
                    labelId="resources.applicationguides.blbGuideButton.website"
                    href="https://www.boston.gov/departments/licensing-board/apply-alcoholic-beverages-retail-license"
                    icon="link"
                />
                <ResourceButton
                    labelId="resources.applicationguides.blbGuideButton.video"
                    href="https://youtu.be/tU-u8-ii1R4?si=-KuGFiMzrtUeCNYP"
                    icon="video"
                />
            </div>
            <div className={titleAndBodyLayout}>
                <h3>
                    <FormattedMessage id="resources.applicationguides.offsiteGuide.title" />
                </h3>
                <p>
                    <FormattedMessage id="resources.applicationguides.offsiteGuide.description" />
                </p>
            </div>
            <div className={`${buttonLayout}`}>
                <ResourceButton
                    labelId="resources.applicationguides.offsiteGuide.website"
                    href="https://docs.google.com/document/d/1lgNSyEYcxv2vo_5Oln4ZFy7RuHcDAOcsbsMSA-3FD9A/edit?usp=sharing"
                    icon="link"
                />
            </div>
            <div className={titleAndBodyLayout}>
                <h3>
                    <FormattedMessage id="resources.applicationguides.toast.title" />
                </h3>
                <p>
                    <FormattedMessage id="resources.applicationguides.toast.text" />
                </p>
            </div>
            <div className={`${buttonLayout}`}>
                <ResourceButton
                    labelId="resources.applicationguides.toast.website"
                    href="https://pos.toasttab.com/blog/on-the-line/how-to-get-a-liquor-license-in-massachusetts?srsltid=AfmBOopAp9ZVROi0VflQVOoNoVkEuouXLzdwWoKQTQztr6FSF2Vy6Zef"
                    icon="link"
                />
            </div>

        </div>
    )
}

