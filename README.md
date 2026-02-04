# Boston Liquor License Tracker

### About

Join us to help build a vibrant and sustainable restaurant scene in Boston neighborhoods through equitable access to Boston's liquor licensing process! Liquor licenses are crucial to the success of small businesses, and can cost more than $600,000 on the transfer market.

In 2024, [the City of Boston approved 225 new liquor licenses](https://www.wbur.org/news/2024/10/10/boston-liquor-license-expansion-what-to-know), 198 of which are non-transferrable and restricted to businesses within 13 zip codes and the Oak Square neighborhood of Brighton with low numbers of restaurants and bars which serve alcohol.

In partnership with the restaurant advocacy group [Offsite Hospitality](https://www.getoffsite.com/), Code for Boston is working to create a mapping and visualization tool that tracks the distribution of these liquor licenses, increasing transparency and enabling equitable access to these licenses by aspiring restaurateurs.

We are looking for product managers, GIS and data visualization experts, visual and content designers, UX researchers, data wranglers, web developers, accessibility experts, and translators to help us make this project a success

#### Project Leadership on CfB Slack:

- @Curt Project Lead
- @Nick Korn Project Sponsor
- @Will CfB Core Team
- @Griffin Barrows Design Lead
- @Matt Clarke Tech Lead

## Contents

- [Project Goals](#project-goals)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)

### Project Goals

- Bring transparency to the city's liquor license inventory and availability
- Align data schema with City of Boston standards where possible (See https://data.boston.gov/)

### Tech Stack
See [Client Page](https://github.com/codeforboston/boston-liquor-license-tracker/tree/main/client) 


# Local Setup

## Install Git Large File Storage

Our repo uses Git LFS for managing large files. GitHub Actions workflows will automatically be able to utilize git-lfs, but contributors will need to install and initialize git-lfs on their local system.

- First install locally (with Homebrew, or see the [official documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files/installing-git-large-file-storage))
```bash 
brew install git-lfs
```
- Then give git access to git-lfs
```bash 
git lfs install
```

## Running the React client:

```bash
cd client
npm install # install dependencies
npm start # start app
```
The app will be running at [http://localhost:5173](http://localhost:5173)

## Running tests

```bash
npm run install:python # installs pytest
npm test               # runs both react and python tests
```
