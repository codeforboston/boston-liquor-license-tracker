import "./case-study.module.css";
import { FormattedMessage } from 'react-intl';
import myImage from '/src/assets/images/phimgsq460.png';

const CaseStudy = () => {
  return (
    <div className="case-study">
      <div className="w-full">
        <h1>
          <FormattedMessage
            id="caseStudy.title"
          />
        </h1>
        <h2 className="w-full break-words whitespace-normal">
          <FormattedMessage
            id="caseStudy.par1"
          />
        <br></br>
        <br></br>
        <FormattedMessage
            id="caseStudy.par2"
          />
        <br></br>
        <br></br>
        <FormattedMessage
            id="caseStudy.par3"
        />
        </h2>
      </div>
      <div className="
          flex justify-center
          h-auto
          overflow-hidden
          dotted-thick-border
          mx-auto
          max w-480px
        "
        >
        <img
          src={myImage}
          alt={<FormattedMessage
            id="caseStudy.image.alt"
            />}
          className="
            object-cover
            transition-transform duration-300 hover:scale-105
            max w-480px
          "
        />
      </div>
      <div className="
        w-full
        flex
        justify-center
        padding-top: 32px
        padding-bottom: 64px
        "
        >
        <button
          className="
            inline-flex
            items-center
            justify-center
            hover:bg-black
            text-black 
            !bg-[#F5B524]
            font-bold
            padding: 16px 32px
            rounded-lg shadow-md
            border-radius: 16px
            gap: 10px
            "
          >
          <FormattedMessage
            id="caseStudy.button.read"
          />
        </button>
      </div>
    </div>
  );
};

export default CaseStudy;
