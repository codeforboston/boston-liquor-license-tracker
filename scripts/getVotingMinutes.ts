import * as cheerio from 'cheerio';
import axios from 'axios'
import fs from 'fs/promises';
import path from 'path';

interface DateType {
   date: string
}

interface EntityType{
   href: string | null, 
   dateText: string, 
   votingDate: string
}

async function main(){
   //get date 
  const url = 'https://www.boston.gov/departments/licensing-board/licensing-board-information-and-members'
   try{
      const pdfDate = await getLatestDate(url)
      const fileName = await downloadVotingMinutes(pdfDate, url)
      console.log('Downloaded the pdf successfully')
      console.log(`${pdfDate.toISOString()}`)
      console.log(`${fileName}`)
   }catch(err){
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
    $(votingMinuteSection).find("ul li a").each((_, e) => {
        const dateText = $(e).text()
        const match = dateText.match(regex)
        if(match){
          const month = match[1]
          const day = parseInt(match[2])
          const year = currentYear
          const date = new Date(`${month} ${day}, ${year}`)
          console.log(`date checked is ${date}`)
          if(date.getTime() === pdfDate.getTime()){
             console.log(`date matched is ${date}`)
             console.log('url matched is ',$(e).attr("href") )
            entity['href'] = $(e).attr("href") ?? null
            entity['dateText'] = $(e).text() 
            entity['date'] = date.toISOString()
          }
        }
    })
    
    if(!entity || !entity['href']){
      throw Error("Could not find entity")
    }
    const mainUrl = 'https://www.boston.gov/'
    const fullUrl = new URL(entity["href"], mainUrl).toString()
    const pdfData = await axios.get(fullUrl, {
      responseType: 'arraybuffer'
    })
    console.log('pdf data is ', pdfData.data)
    const fileName = entity["href"].split('/').pop()
    console.log('file name is ', fileName)
    if(fileName){
      const filePath = path.join(__dirname, fileName)
      fs.writeFile(filePath, pdfData.data)
    }else{
      throw new Error("could not get the file name")
    }

    return fileName

  }catch(err){
     throw new Error(err)
  }

}
//fuction should get latest date, if date extracted is same as 
//date in recorde_meeting_data.json then throw an error, 
//if date is good then return 
//date is good if it is latest less than correct date is differnt that recorded date
async function getLatestDate(url: string) {
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

    const pastDates = meetingDates.filter((date) => date <= currentDate)
    const maxPastDate = new Date(Math.max(...pastDates.map(d => d.getTime())))
    try{
      const lastProcessedDate = await getWrittenLatestDate(maxPastDate)
      if(lastProcessedDate.getTime() === maxPastDate.getTime()){
        console.log("No new date found to add entities")
        process.exit(0)
      }
    } catch(err){
       console.log('Last processed date file is not found')
    }

    return maxPastDate;
  } catch (error) {
    console.error("Error scraping next meeting date:", error);
    throw error; // Re-throw the error so further Github Actions steps are aborted
  }
}
async function getWrittenLatestDate(date: Date){
  const path = '../data/last_processed_date.json'
  try{
      const data = await fs.readFile(path, 'utf-8')
      const parsed = JSON.parse(data)
      const lastestDate = new Date(parsed.date)
      return lastestDate
  }catch(err: any){
     throw err
  }
}


main()

