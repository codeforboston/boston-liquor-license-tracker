import * as cheerio from "cheerio";
import axios from "axios";
import { writeFileSync } from "node:fs";

async function scrapeNextMeetingDate(url: string): Promise<Date | null> {
  try {
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
  } catch (error) {
    console.error("Error scraping next meeting date:", error);
    throw error; // Re-throw the error so further Github Actions steps are aborted
  }
}

const nextMeetingDate = await scrapeNextMeetingDate(
  "https://www.boston.gov/departments/licensing-board/licensing-board-information-and-members"
);
if (
  nextMeetingDate &&
  nextMeetingDate instanceof Date &&
  !isNaN(nextMeetingDate.getTime())
) {
  const meetingDateObject = {
    nextMeetingDate: nextMeetingDate.toISOString(),
  };
  const meetingDateString = JSON.stringify(meetingDateObject);
  writeFileSync("../data/next-meeting-date.json", meetingDateString);
} else {
  console.error("Invalid next meeting date:", nextMeetingDate);
  throw new Error("Failed to scrape a valid next meeting date.");
}
