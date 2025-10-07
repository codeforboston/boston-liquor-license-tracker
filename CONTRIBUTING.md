# WIP document
# Contributing to the Boston Liquor License Tracker

Thank you for your volunteer effort! We appreciate your help in improving visibility into Boston's liquor licensing process. This document outlines how you can contribute to the project.

## Ways to Contribute
### Getting Started
- The best way to stay updated on this project is to attend our weekly meetings on Tuesdays at 7PM ET. You can find the invite link (here)[https://www.codeforboston.org/]
- If you are unable to attend the meetings, Slack is another great way to stay in touch. You can join our workspace (here)[https://communityinviter.com/apps/cfb-public/default-badge] and join the #boston-liquor-license-tracker channel.
- To work on a ticket, you will need to gain access to the repository. Please contact the project lead to request access. Our project lead is @CurtSavoie on GitHub, or @Curt on Slack.
- You can work on this project either by creating a branch on this repository, or creating fork

### Reporting Issues
- Once you have access to the repository, you can create issues for any bugs you find. Please provide as much detail as possible, including steps to reproduce the issue, expected behavior, and actual behavior.

### Pull Requests
Make sure to follow these guidelines when submitting a pull request:
#### Accessibility
It is recommended that you familiarize yourself with Web Content Accessibility Guidelines (WCAG). See our documentation on (Accessibility)[https://docs.google.com/document/d/1VpyNJkx9qEVwT7nAOzC9fljy-vZuoBCVonfchXVXb9c]
- [ ] Ensure that all interactive elements are accessible via keyboard navigation (e.g., using `Tab`, `Enter`, and `Space` keys).
- [ ] Ensure that pages are navigable using only a keyboard.
- [ ] Use semantic HTML elements where appropriate (e.g., `<button>`, `<nav>`, `<main>`, etc.).
#### Translations
- [ ] All text should be translatable. Use our (i18n framework)[https://github.com/codeforboston/boston-liquor-license-tracker/tree/main/client/src/i18n] for any new text.
- [ ] Only add new text in English. We will handle translations later. Please name translation keys that indicate which page they are for, or with `ui` for general UI elements.
- [ ] If you would like to contribute translations, please check our open tickets. We are only looking for translations for pages with finalized copy.
#### Code Style
- [ ] We use double spaces for indentation.
#### Merge Process
- [ ] Ensure that you have tested your changes locally. You can run the test suite with `npm test`
