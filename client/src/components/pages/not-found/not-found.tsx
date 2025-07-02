import notFoundStyles from "./not-found.module.css"
import { FormattedMessage } from "react-intl";
import beerTap from "@/assets/images/beer-tap.png";
import BackToHome from "./back-to-home";



const NotFound = () => {
  return(

    <main className={notFoundStyles.notFound}>
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
      <BackToHome />
      </div>
    </div>
      <img src={beerTap} className="beer-tap" alt="Beer Tap"/>
    </main>

  )
}

export default NotFound
