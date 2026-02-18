# Travel Itinerary Organiser

A command-line application for managing travel activities and budgets. Built with TypeScript and Inquirer, it lets users plan trips by adding activities, tracking costs, and looking up destination information.

## Setup

```bash
npm install
npm start
```

## Features

### Trip Management
- Create new trips with a destination and start date
- View all trips with activity count
- Select a trip to work with
- Delete a trip

### Activity Management
- View all activities sorted chronologically
- Filter activities by category (food, transport, sightseeing)
- Filter activities by specific day
- Add new activities with name, cost, category, and start time
- Delete an activity

### Budget Tracking
- View the total cost of a trip
- Find activities above a cost threshold

### Destination Info
- Look up any country's currency and flag using the REST Countries API

## Project Structure

```
src/
  cli.ts                        - Interactive menu and user prompts
  models.ts                     - TypeScript types (Activity, Trip)
  services/
    activityService.ts          - Add, delete, filter, and sort activities
    budgetManager.ts            - Trip cost calculations
    destinationService.ts       - Country info from REST Countries API
    tripService.ts              - Create, delete, and list trips
db.json                         - Trip and activity data
```

## Built With

- **TypeScript** - Type-safe JavaScript
- **Inquirer** - Interactive CLI prompts
- **date-fns** - Date comparison and sorting
- **REST Countries API** - Destination data
