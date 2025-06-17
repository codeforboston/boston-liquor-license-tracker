import "./about-us.css";
import { FormattedMessage } from "react-intl";

const AboutUs = () => {
  return (
    <div className="about-us w-full">
      <h1>
        <FormattedMessage id="aboutUs.title" />
      </h1>
      <h2 className="w-full break-words whitespace-normal">
        <FormattedMessage
          id="aboutUs.weAre"
          values={{ b: (chunks) => <b>{chunks}</b> }}
        />
      </h2>
    </div>
  );
};

export default AboutUs;
