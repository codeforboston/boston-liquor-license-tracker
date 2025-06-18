import { FormattedMessage } from "react-intl";
import "./header.css";
import * as cheerio from "cheerio";
import axios from "axios";
import { useEffect, useState } from "react";

async function scrapeNextMeetingDate(url: string): Promise<Date | null> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const currentYearElement = $("section#content") // Main page content
    .find(".paragraphs-item-drawers")
    .first() // Upcoming Hearing Dates
    .find(
      `.paragraphs-item-drawer .field.field-label-hidden div:contains('${currentYear}')` // Label element containing the current year
    )
    .parentsUntil(".section-drawers") // Lowest common ancestor of the label element and the list of dates
    .find(".entity .field ul"); // List of dates

  const currentDateStrings = currentYearElement
    .text()
    .split("\n")
    .filter((dateString) => !!dateString && dateString.includes("Voting"))
    .map((dateString) => dateString.replace(/\(Voting\)/g, "").trim());

  const meetingDates = currentDateStrings.map(
    (dateString) => new Date(`${dateString}, ${currentYear}`)
  );

  const nextMeetingDate =
    meetingDates.find((date) => date > currentDate) ?? null;

  return nextMeetingDate;
}

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
  const [nextMeetingDate, setNextMeetingDate] = useState(
    new Date("2000-01-01") // Use a date in the past so nothing is shown unless we get a valid and future date
  );
  useEffect(() => {
    async function fetchNextMeetingDate() {
      const date = await scrapeNextMeetingDate(
        "https://www.boston.gov/departments/licensing-board/licensing-board-information-and-members"
      );
      if (date) {
        setNextMeetingDate(date);
      }
    }
    fetchNextMeetingDate();
  }, []);
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
