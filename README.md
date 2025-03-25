# Boston Liquor License Tracker

### About

Join us to help build a vibrant and sustainable restaurant scene in Boston neighborhoods through equitable access to Boston's liquor licensing process! Liquor licenses are crucial to the success of small businesses, and can cost more than $600,000 on the transfer market.

In 2024, [the City of Boston approved 225 new liquor licenses](https://www.wbur.org/news/2024/10/10/boston-liquor-license-expansion-what-to-know), 198 of which are non-transferrable and restricted to businesses within 13 zip codes and the Oak Square neighborhood of Brighton with low numbers of restaurants and bars which serve alcohol. 

In partnership with the restaurant advocacy group [Offsite Hospitality](https://www.getoffsite.com/), Code for Boston is working to create a mapping and visualization tool that tracks the distribution of these liquor licenses, increasing transparency and enabling equitable access to these licenses by aspiring restaurateurs. 

We are looking for product managers, GIS and data visualization experts, visual and content designers, UX researchers, data wranglers, and web developers to help us make this project a success


#### Project Leadership on CfB Slack: 
- @Curt Project Lead
- @Nick Korn Project Sponsor
- @Will CfB Core Team

## Contents
- [Project Goals](#project-goals)
- [Tech Stack](#tech-stack)
- [Project Progress](#project-progress)
- [Running the Project locally (with Docker Compose)](#running-the-project-locally-with-docker-compose)
- [Running the Project locally (without Docker Compose)](#running-the-project-locally-without-docker-compose)

### Project Goals

- Bring transparency to the city's liquor license inventory and availability
- Deliver working V0 prototype to project sponsor for May 23rd licensing round, refine for V1 launch this summer
- Align data schema with City of Boston standards where possible (See https://data.boston.gov/)

### Tech Stack
- Frontend: React with Vite
- Backend: Express

### Project Progress
Meetings every Tuesday at [Code for Boston](https://www.codeforboston.org/)
- March 4, 2025: Project Kickoff
- March 11, 2025: Overall workplan discussion and sub-team breakouts around data, tech stack, and product design
- March 18, 2025: Decided on express for a backend, react with vite for a frontend.

## Running the Project locally (with Docker Compose)
1. [Install Docker](https://www.docker.com/)
2. From the root of this project, run docker-compose:
```bash
docker-compose up --build
```

## Running the Project locally (without Docker Compose)
1. ### Run the api server:
  * Change to the `api` directory:
  ```bash
  cd api
  ```
  * Install dependencies:
  ```bash
  npm install
  ```
  * Start the server:
  ```bash
  npm start
  ```
  * The api server will be running at [http://localhost:3000](http://localhost:3000)
