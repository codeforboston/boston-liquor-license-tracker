# Contributing to the Boston Liquor License Tracker

Thank you for your volunteer effort! We appreciate your help in improving visibility into Boston's liquor licensing process.

## Contents
- [Join the project team](#join-the-project-team)
- [Reporting Issues](#reporting-issues)
- [Pull Requests](#pull-requests)

## Join the Project Team
- The best way to stay updated on this project is to attend our weekly meetings on Tuesdays at 7PM ET. You can find the invite link (here)[https://www.codeforboston.org/]
- If you are unable to attend the meetings, Slack is another great way to stay in touch. You can join our workspace (here)[https://communityinviter.com/apps/cfb-public/default-badge] and join the #boston-liquor-license-tracker channel.
- To work on a ticket, you will need to gain access to the repository. Please contact a project admin to request access. Our project lead is @CurtSavoie on GitHub, or @Curt on Slack. Our tech lead is @MattClarke131 on Github, or @Matt Clarke on slack
- You can work on this project either by creating a branch on this repository, or creating fork

## Reporting Issues
- Once you have access to the repository, you can create issues for any bugs you find. Please provide as much detail as possible, including steps to reproduce the issue, expected behavior, and actual behavior.

## Pull Requests
### Accessibility
It is recommended that you familiarize yourself with Web Content Accessibility Guidelines (WCAG). See our documentation on (Accessibility)[https://docs.google.com/document/d/1VpyNJkx9qEVwT7nAOzC9fljy-vZuoBCVonfchXVXb9c]
- [ ] Ensure that all interactive elements are accessible via keyboard navigation (using `Tab`, `Enter`, `Space`, and arrow keys).
- [ ] Use semantic HTML elements where appropriate (e.g., `<button>`, `<nav>`, `<main>`, etc.).
- [ ] Test changes on 200% magnification, and on small screens.
- [ ] Avoid horizontal scrolling.
- [ ] Add alt-text to all images.
### Translations
- [ ] All text, and alt-text should be translatable. Use our (i18n framework)[https://github.com/codeforboston/boston-liquor-license-tracker/tree/main/client/src/i18n] for any new text.
- [ ] Only add new text in English. We will handle translations internally. Please name translation keys that indicate which page they are for, or with `ui` for general UI elements.
### Code Style / Linting
- [ ] You can run our linters locally with `npm run lint` and `npm run lint:css`. You will also notice automated comments on your PR from our linter. We will request that you address linter errors before merging.
#### Merge Process
- [ ] Ensure that you have tested your changes locally. You can run the test suite with `npm test`.
- [ ] Request a review from the @maintainers group.
