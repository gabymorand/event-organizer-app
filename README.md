# Event Organizer App

## Overview
The Event Organizer App is a web application designed to help users organize and manage events, vote on venues, and coordinate after-work activities. It integrates with Google Calendar to facilitate event management and provides a user-friendly interface for voting on various options.

## Features
- **Party Calendar**: Navigate through a calendar interface to view and vote on upcoming events.
- **Best Bars Voting**: A list of the best bars where users can vote for their favorites.
- **Best Karaoke Venues Voting**: A list of top karaoke venues with a voting system.
- **Event Member Management**: Add members to events directly through Google Calendar.
- **After-Work Activities**: A section dedicated to after-work activities with voting options.

## Project Structure
```
event-organizer-app
├── src
│   ├── Code.gs
│   ├── calendar
│   │   ├── CalendarService.gs
│   │   └── EventManager.gs
│   ├── voting
│   │   ├── VotingService.gs
│   │   └── VoteManager.gs
│   ├── venues
│   │   ├── BarService.gs
│   │   └── KaraokeService.gs
│   ├── members
│   │   └── MemberService.gs
│   └── utils
│       └── Helpers.gs
├── html
│   ├── index.html
│   ├── calendar.html
│   ├── bars.html
│   ├── karaoke.html
│   └── activities.html
├── css
│   └── styles.html
├── js
│   └── client.html
├── appsscript.json
└── README.md
```

## Setup Instructions
1. Clone the repository to your local machine.
2. Open the project in Google Apps Script.
3. Deploy the application as a web app.
4. Set the necessary OAuth scopes in `appsscript.json` for Google Calendar access.

## Usage
- Access the application through the deployed web app URL.
- Use the navigation to explore the party calendar, vote on venues, and manage events.
- Add members to events using the integrated Google Calendar functionality.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.