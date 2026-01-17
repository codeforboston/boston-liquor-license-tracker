
import * as cheerio from 'cheerio';
import axios from 'axios'
import fs from 'fs/promises';
import path from 'path'
import { fileURLToPath } from "url";
import {LAST_PROCESSED_DATE_JSON, BOSTON_URL} from "./paths.js"
import { writeFile } from 'fs';

interface EntityType{
   href: string | null, 
   dateText: string, 
   votingDate: string
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main(){
   // Entrypoint: fetch the latest meeting date, download the corresponding PDF,
   // and log structured JSON output for liqour-license-applicant-pipeline workflow.'
   try{
      const pdfDate = await getLatestDate(BOSTON_URL)
      if(!pdfDate){
        const result = {
           success: true,
           pdfDate: null, 
           fileName: null, 
           message: 'No new date found to add entities - already up to date'
        }
        console.log("::JSON_OUTPUT::"+JSON.stringify(result))
        return
      }
    
      const fileName = await downloadVotingMinutes(pdfDate, BOSTON_URL)
      console.log("fileName is ", fileName)
      const result = {
         success : true, 
         pdfDate: pdfDate.toISOString(),
         fileName: fileName, 
         message: 'Downloaded the pdf successfully'
      }
      console.log("::JSON_OUTPUT::"+JSON.stringify(result))

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

async function downloadVotingMinutes(pdfDate : Date, url: string) : Promise<string> {
  try{
   const regex = /Voting Minutes:\s+\w+,\s+([A-Za-z]+)\s+(\d{1,2})/;
   const currentDate = new Date()
   const currentYear = currentDate.getFullYear()
   const response = await axios.get(url)
   const $ = cheerio.load(response.data)
   
   // Locate the container that has the list of past Voting Minutes for the current year
   const votingMinuteSection = $("section#content")
    .find(".paragraphs-item-drawers")
    .last()
    .find(
        `.paragraphs-item-drawer .field.field-label-hidden div:contains('${currentYear}')` // Label element containing the current year
      )
    .closest(".paragraphs-item-drawer");

    if(!votingMinuteSection.length){
      throw Error(`Could not find the section with the year ${currentYear}`)
    }

    let entity = {} as EntityType
    // NOTE: Updated selector from `ul li a` to `a[href*=".pdf"]` because the webpage
    // DOM structure changed and no longer uses list-based markup. Selecting by `href`
    // makes the scraper resilient to layout changes and focuses on the actual document links.
    $(votingMinuteSection).find(`a[href$=".pdf"]`).each((_, e) => {
        const dateText = $(e).text()
        console.log("date text is ", dateText)
        const match = dateText.match(regex)
        if(match){
          const month = match[1]
          const day = parseInt(match[2])
          const year = currentYear
          const date = new Date(`${month} ${day}, ${year}`)
          date.setUTCHours(0, 0, 0, 0);
          console.log(`date checked is ${date}`)
          if(date.getTime() === pdfDate.getTime()){
            entity['href'] = $(e).attr("href") ?? null
            entity['dateText'] = $(e).text() 
            entity['votingDate'] = date.toISOString()
            console.log(JSON.stringify(entity))
          }
        }
    })
    
    if(!entity || !entity['href']){
      // If this happens, the meeting date exists on the site but has no PDF link yet
      throw Error("Could not find entity")
    }
    const downloadUrlString = entity['href'] as string;
    let downloadUrl = new URL(downloadUrlString, "https://www.boston.gov")
    // 1. Convert Google Drive preview link → direct download
    const driveMatch = downloadUrlString.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      downloadUrl = new URL(`https://drive.google.com/uc?export=download&id=${fileId}`);
    }

    const pdfData = await axios.get(downloadUrl.toString(), {
      responseType: "arraybuffer",
    })

    let fileName;

    const disposition = pdfData.headers["content-disposition"];
    if (disposition) {
      const match = disposition.match(/filename="(.+?)"/);
      if (match) {
        fileName = match[1];
      }
    }

    if (typeof downloadUrlString !== "string") {
      throw new Error("downloadUrl is not a string");
    } 

    if (!fileName) {
      let elems = downloadUrlString.split("/")
      fileName = elems.pop()
    }
    
    if(fileName){
      const filePath = path.join(__dirname, fileName)
      await fs.writeFile(filePath, pdfData.data)
    }else{
      throw Error("could not get the file name")
    }


    return fileName

  }catch(err){
     throw err
  }

}


/**
 * Determines the most recent past meeting date that has already occurred.
 * If the latest processed date matches it, the script terminates early
 * to avoid redundant downloads.
 */
async function getLatestDate(url: string): Promise<Date| null> {
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
       .map((dateString) => {
        // Clean the date string more thoroughly
        return dateString
          .replace(/^([A-Za-z]+ \d{1,2}).*$/, "$1") // Keep only "Month DD" at the start
          .trim();
      });
    
    const meetingDates = currentDateStrings.map((dateString) => {
      const d = new Date(`${dateString}, ${currentYear} UTC`);
        d.setUTCHours(0, 0, 0, 0); // normalize to UTC midnight
        return d;
    });

   
    // Only consider meetings that have already happened
    const pastDates = meetingDates.filter((date) => date <= currentDate)
    if (pastDates.length === 0) {
      console.log("No past meeting dates found")
      return null
    }
    try{
      const lastProcessedDate = await getWrittenLatestDate()
      console.log("lat processed date is ", lastProcessedDate)
      const unprocessedDates = pastDates.filter((date) => date > lastProcessedDate)
      console.log("unprocessed dates are ",unprocessedDates);
      if (unprocessedDates.length === 0) {
        console.log("No new date found to add entities")
        return null // Return null instead of process.exit(0)
      }
      const nextDateToProcess = new Date(Math.min(...unprocessedDates.map(d => d.getTime())))
      return nextDateToProcess
    } catch(err){
       console.log('Last processed date file is not found')
       const maxPastDate = new Date(Math.max(...pastDates.map(date => date.getTime())))
       return maxPastDate;
    }

  } catch (error) {
    console.error("Error scraping next meeting date:", error);
    throw error; // Re-throw the error so further Github Actions steps are aborted
  }
}

async function getWrittenLatestDate(){
  const dateFilePath = path.join(__dirname, '..', LAST_PROCESSED_DATE_JSON)
  try{
      const data = await fs.readFile(dateFilePath, 'utf-8')
      const parsed = JSON.parse(data)
      const lastestDate = new Date(parsed.date)
      return lastestDate
  }catch(err: any){
     throw err
  }
}


await main()