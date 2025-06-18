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
  const currentYearElement = $("section#content")
    .find(".paragraphs-item-drawers")
    .first()
    .find(
      `.paragraphs-item-drawer .field.field-label-hidden div:contains('${currentYear}')`
    )
    .parentsUntil(".section-drawers")
    .find(".entity .field ul");

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
    new Date("2000-01-01")
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
