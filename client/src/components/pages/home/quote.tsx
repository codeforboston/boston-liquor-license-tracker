import './quote.css';
import { FormattedMessage } from "react-intl";

const Quote = () => {
  return (
    <div className="quote">
      <h1>
        <FormattedMessage id="home.quote" />
      </h1>
    </div>
  )
}

export default Quote
