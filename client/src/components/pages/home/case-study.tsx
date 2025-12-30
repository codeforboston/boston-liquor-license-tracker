import { useIntl, FormattedMessage } from 'react-intl';
import caseStudyStyles from "./case-study.module.css";
import ReadStudyButton from "./read-study-button";
import VimeoPlayer from "./vimeo-video";

const CaseStudy = () => {
  const intl = useIntl();
  const videoTitle = intl.formatMessage({ id: "home.caseStudy.video.title" });
  return (
    <div className={caseStudyStyles.caseStudy}>
        <div className={`${caseStudyStyles.studyIntro}`}>
          <h2>
            <FormattedMessage id="home.caseStudy.title" />
          </h2>
          <p><FormattedMessage id="home.caseStudy.part1" /></p>
          <p><FormattedMessage id="home.caseStudy.part2" /></p>
          <p><FormattedMessage id="home.caseStudy.part3" /></p>
        </div>

        <div className={`${caseStudyStyles.dottedThickBorder} flex justify-center h-auto overflow-hidden mx-auto max-w-[640px] box-border`}
          >
          <div className="scale-110 w-full">
            <VimeoPlayer 
              videoId="882676233"
              hash="2f05014c6a"
              width="100%"
              height="290"
              title={videoTitle}
            />
          </div>
        </div>

        <div className="
          w-full
          flex
          justify-center
          "
          >
          <ReadStudyButton to={"/coming-soon"} messageId={"home.caseStudy.button.read"}/>
        </div>
      </div>
  );
};

export default CaseStudy;
