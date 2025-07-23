import "./case-study.module.css";
import { useIntl, FormattedMessage } from 'react-intl';
import myImage from '/src/assets/images/phimgsq460.png';
import caseStudyStyles from "./case-study.module.css";
import ReadStudyButton from "./read-study-button";

const CaseStudy = () => {
  const intl = useIntl();
  return (
    <div className={caseStudyStyles.caseStudy}>
        <div className="!p-0 !m-0 max-w-[840px] w-auto flex-shrink">
          <h1 className ="text-2xl max-w-[840px] w-auto flex-shrink mb-[16px]">
            <FormattedMessage
              id="caseStudy.title"
            />
          </h1>
          <h2 className="case-study h2 !p-0 !m-0 !ml-0 !pl-0 !indent-0 ![margin-bottom:32px]">
            <FormattedMessage
              id="caseStudy.par1"
            />
          <br />
          <br />
          <FormattedMessage
              id="caseStudy.par2"
            />
          <br />
          <br />
          <FormattedMessage
              id="caseStudy.par3"
          />
          </h2>
        </div>
        <div className={`${caseStudyStyles.dottedThickBorder} flex justify-center h-auto overflow-hidden mx-auto max-w-[480px] box-border ![margin-bottom:32px]`}
          >
          <img
            src={myImage}
            alt={intl.formatMessage({ id: "caseStudy.image.alt" })}
            className="
              w-full
              max-w-[480px]
              h-auto
              object-cover
              transition-transform duration-300 hover:scale-105
              block
              m-auto
            "
          />
        </div>
        <div className="
          w-full
          flex
          justify-center
          ![margin-bottom:64px]
          "
          >
          <ReadStudyButton to={"/coming-soon"} messageId={"caseStudy.button.read"}/>
        </div>
      </div>
  );
};

export default CaseStudy;
