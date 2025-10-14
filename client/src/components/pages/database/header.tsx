import { FormattedMessage } from "react-intl";
import NEXT_MEETING_DATE from "../../../data/next-meeting-date.json";
import { PageHeader } from "@/components/ui/pageheader";

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
  const nextMeetingDate = NEXT_MEETING_DATE.nextMeetingDate
    ? new Date(NEXT_MEETING_DATE.nextMeetingDate)
    : null;

  return (
    <header>
      <PageHeader
        headerTitle={<FormattedMessage id="database.header.title" />}
        headerText={<FormattedMessage id="database.header.description" />}
      >
        {getNextMeetingText(nextMeetingDate)}
      </PageHeader>
    </header>
  );
};

export default Header;
