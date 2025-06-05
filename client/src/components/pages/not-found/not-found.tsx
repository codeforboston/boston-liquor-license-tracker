import "./not-found.css"
import { FormattedMessage } from "react-intl";
import beerTap from "@/assets/images/beer-tap.png";

const NotFound = () => {
  return(
    <>
    <div className="not-found">
      <div className="not-found-heading">
      <h2 className="text-white text-2xl md:text-3xl lg:text-5xl w-full font-bold">
        <FormattedMessage
        id="notFound.heading"
        />
      </h2>
      <br/>
      <p className="text-white">
        <FormattedMessage
          id="notFound.message"
        />
      </p>
      <br/>
      {/* Replace with back to home component when done */}
      <a className="text-white" href="/">Go to Home</a>
      </div>
    </div>
      <img src={beerTap} className="beer-tap" alt="Beer Tap"/>
    </>
  )
}

export default NotFound
