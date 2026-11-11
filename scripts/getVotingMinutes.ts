
import * as cheerio from 'cheerio';
import axios from 'axios'
import fs from 'fs/promises';
import path from 'path'
import { fileURLToPath } from "url";
import {LAST_PROCESSED_DATE_JSON, BOSTON_URL} from "./paths.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Matches "Voting Minutes: Thursday, October 29" and "Voting Minutes: Thursday, October 29, 2026"
const MINUTES_LINK_REGEX = /Voting Minutes:\s+\w+,\s+([A-Za-z]+)\s+(\d{1,2})/;

/**
 * Entrypoint: pick the oldest voting meeting that has happened but has not been
 * processed, download its minutes PDF, and log structured JSON output for the
 * liquor-license-applicant-pipeline workflow.
 *
 * - Looks at the current AND previous year, so a late-December meeting is still
 *   picked up when the workflow runs in January.
 * - A meeting whose minutes are not posted yet is a no-op (success, no file),
 *   not a failure; the next weekly run tries again.
 * - A meeting whose minutes never appear (e.g. cancelled) is skipped once a
 *   later meeting's minutes are posted, so the pipeline cannot get stuck.
 */
async function main(){
   try{
      const now = new Date()
      const years = [now.getUTCFullYear() - 1, now.getUTCFullYear()]
      const $ = cheerio.load((await axios.get(BOSTON_URL)).data)

      const meetingDates = years.flatMap((year) => getMeetingDates($, year))
      const minutesLinks = new Map<number, string>()
      for (const year of years) {
         for (const [time, href] of getMinutesLinks($, year)) minutesLinks.set(time, href)
      }

      const lastProcessed = await getWrittenLatestDate()
      const unprocessed = meetingDates
         .filter((d) => d <= now && (!lastProcessed || d > lastProcessed))
         .sort((a, b) => a.getTime() - b.getTime())
      const candidates = lastProcessed ? unprocessed : unprocessed.slice(-1)

      const next = candidates.find((d) => minutesLinks.has(d.getTime()))
      const skipped = next ? candidates.filter((d) => d < next) : []
      skipped.forEach((d) =>
         console.log(`WARNING: no minutes posted for ${d.toISOString().slice(0, 10)}; a later meeting has minutes, so skipping it`)
      )

      if (!next) {
         const message = candidates.length
            ? `Minutes not posted yet for ${candidates.map((d) => d.toISOString().slice(0, 10)).join(", ")}`
            : 'No new date found to add entities - already up to date'
         console.log("::JSON_OUTPUT::" + JSON.stringify({ success: true, pdfDate: null, fileName: null, message }))
         return
      }

      // Save under a stable, date-based name (matches the scraper's naming) so the
      // transform pipeline can read the meeting date from the file name.
      const fileName = `voting_minutes_${next.toISOString().slice(0, 10)}.pdf`
      await downloadPdf(minutesLinks.get(next.getTime()) as string, fileName)
      console.log("fileName is ", fileName)
      console.log("::JSON_OUTPUT::" + JSON.stringify({
         success : true,
         pdfDate: next.toISOString(),
         fileName: fileName,
         message: 'Downloaded the pdf successfully'
      }))

   }catch(err){
      const errResult = {
        success : false,
        pdfDate: null,
        fileName: null,
        message: String(err)
      }
      console.log("::JSON_OUTPUT::"+JSON.stringify(errResult))
      throw err
   }
}

function utcDate(month: string, day: number, year: number): Date {
   const d = new Date(`${month} ${day}, ${year} UTC`)
   d.setUTCHours(0, 0, 0, 0)
   return d
}

/** Voting meeting dates listed for `year` in the "Upcoming Hearing Dates" drawers. */
function getMeetingDates($: cheerio.CheerioAPI, year: number): Date[] {
   const list = $("section#content")
      .find(".paragraphs-item-drawers")
      .first() // Upcoming Hearing Dates
      .find(`.paragraphs-item-drawer .field.field-label-hidden div:contains('${year}')`)
      .first()
      .parentsUntil(".section-drawers") // Lowest common ancestor of the label and the list of dates
      .find(".entity .field ul")

   return list
      .text()
      .split("\n")
      .filter((s) => !!s && s.includes("Voting"))
      .map((s) => s.replace(/^([A-Za-z]+) (\d{1,2}).*$/, "$1 $2").trim())
      .map((s) => {
         const [month, day] = s.split(" ")
         return utcDate(month, parseInt(day), year)
      })
      .filter((d) => !isNaN(d.getTime()))
}

/** Minutes PDF links for `year`, keyed by meeting date (UTC midnight, ms). */
function getMinutesLinks($: cheerio.CheerioAPI, year: number): Map<number, string> {
   const links = new Map<number, string>()
   const section = $("section#content")
      .find(".paragraphs-item-drawers")
      .last()
      .find(`.paragraphs-item-drawer .field.field-label-hidden div:contains('${year}')`)
      .first()
      .closest(".paragraphs-item-drawer")

   // Select by href rather than list markup; the page layout has changed before.
   section.find(`a[href$=".pdf"]`).each((_, e) => {
      const match = $(e).text().match(MINUTES_LINK_REGEX)
      const href = $(e).attr("href")
      if (match && href) {
         const date = utcDate(match[1], parseInt(match[2]), year)
         if (!isNaN(date.getTime())) links.set(date.getTime(), href)
      }
   })
   return links
}

async function downloadPdf(downloadUrlString: string, fileName: string): Promise<void> {
    let downloadUrl = new URL(downloadUrlString, "https://www.boston.gov")
    // Convert Google Drive preview link → direct download
    const driveMatch = downloadUrlString.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      downloadUrl = new URL(`https://drive.google.com/uc?export=download&id=${driveMatch[1]}`);
    }

    const pdfData = await axios.get(downloadUrl.toString(), { responseType: "arraybuffer" })
    const bytes = Buffer.from(pdfData.data)
    if (bytes.subarray(0, 5).toString() !== "%PDF-") {
      throw Error(`Downloaded file from ${downloadUrl} is not a PDF`)
    }
    await fs.writeFile(path.join(__dirname, fileName), bytes)
}

async function getWrittenLatestDate(): Promise<Date | null> {
  try {
    const dateFilePath = path.join(__dirname, '..', LAST_PROCESSED_DATE_JSON)
    const parsed = JSON.parse(await fs.readFile(dateFilePath, 'utf-8'))
    return new Date(parsed.date)
  } catch {
    console.log('Last processed date file is not found')
    return null
  }
}


await main()
