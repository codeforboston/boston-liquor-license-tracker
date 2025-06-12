import { FormattedMessage } from "react-intl";
import "./header.css";

// TODO: Replace with actual logic for getting the next meeting date
const nextMeetingDate = null;

// Show the next meeting date if and only if we have one and it is in the future
const getNextMeetingText = (nextMeeting: Date | null) => {
  const today = new Date();
  if (nextMeeting && nextMeeting > today) {
    return (
      <p className="header-text">
        <FormattedMessage
          id="database.header.nextMeeting"
          values={{
            nextMeetingDate: nextMeeting,
            strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
          }}
        />
      </p>
    );
  } else {
    return null;
  }
};

const Header = () => {
  return (
    <header className="database-header">
      <div className="text-container">
        <h1 className="header-title">
          <FormattedMessage id="database.header.title"></FormattedMessage>
        </h1>
        <p className="header-text">
          <FormattedMessage id="database.header.description"></FormattedMessage>
        </p>
        {getNextMeetingText(nextMeetingDate)}
      </div>
    </header>
  );
};

export default Header;
