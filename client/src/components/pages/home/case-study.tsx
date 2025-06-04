import React, { useState } from 'react';
import './case-study.css';
import { FormattedMessage } from 'react-intl';
import myImage from '/src/assets/images/phimgsq460.png';

const CaseStudy = () => {
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const handleButtonClick = () => {
    console.log("button clicked!");
    setShowMessage(true); // Set state to true to show the message
  };

  return (
    <div className="case-study">
      <div className="w-full">
        <h1>
          <FormattedMessage
            id="caseStudy.title"
            defaultMessage="Why is this important?"
          />
        </h1>
        <h2 className="w-full break-words whitespace-normal">
          <FormattedMessage
            id="caseStudy.par1"
            defaultMessage={`Getting a Liquor License in Boston has long meant being part of an "In Club" of restaurant owners, hospitality companies, and lawyers who've mastered the process. It has historically meant newcomers to the space have struggled to obtain these artificially scarce licenses and has created droughts in neighborhoods all over the city. Often in neighborhoods seen as traditionally less white with more diverse character.`}
          />
        <br></br>
        <br></br>
        <FormattedMessage
            id="caseStudy.par2"
            defaultMessage="Recent changes to Boston's License system have made moves to improve access to Licenses. A new law passed in 2024 aims to give parts of the city specific Licenses and allow locals to open businesses. But this is just the start, tracking available licenses is still difficult and often out of reach to some members of Boston's community."
          />
        <br></br>
        <br></br>
        <FormattedMessage
            id="caseStudy.par3"
            defaultMessage="With this site we are working to create a more equitable restaurant ecosystem for all, and allow you to track and understand what Licenses are available to you."
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
            defaultMessage="Medium-sized empty white square"
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
          onClick={handleButtonClick}
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
            defaultMessage="READ THE FULL CASE STUDY"
          />
        </button>
      </div>
      {showMessage && (
        <p className="mt-5 text-green-600 font-semibold animate-fade-in text-center">
          TESTING
        </p>
      )}  

    </div>
  )
}
export default CaseStudy
