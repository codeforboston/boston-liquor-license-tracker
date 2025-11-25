import styles from './quote.module.css';
import { FormattedMessage } from "react-intl";

const Quote = () => {
  return (
    <div className={`${styles.quote}`}>
      <h3>
        <FormattedMessage id="home.quote" />
      </h3>
    </div>
  )
}

export default Quote
