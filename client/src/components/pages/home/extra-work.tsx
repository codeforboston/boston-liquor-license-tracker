import './extra-work.css';
import { FormattedMessage } from 'react-intl';

const ExtraWork = () => {
  return (
    <div className="extra-work">
      <div className="w-full">
        <h1>
          <FormattedMessage
            id="extraWork.title"
            defaultMessage="Extra Work"
          />
        </h1>
      </div>
    </div>
  )
}
export default ExtraWork
