import inquirer from "inquirer";
import {
  getActivitiesChronologically,
  getActivitiesByCategory,
  getActivitiesByDay,
  addActivity,
  deleteActivity,
} from "./services/activityService";
import { getTripTotalCost, findHighCostItem } from "./services/budgetManager";
import { getDestinationInfo } from "./services/destinationService";
import { addTrip, deleteTrip, getTrips } from "./services/tripService";

let currentTripId: string | null = null;

// shows all activities sorted by time
const handleViewActivities = async () => {
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }
  const activities = await getActivitiesChronologically(currentTripId);
  if (activities.length === 0) {
    console.log("\nNo activities found.");
  } else {
    console.log("\n--- Activities (Chronological) ---");
    activities.forEach((a) => {
      console.log(
        `- ${a.name} | $${a.cost} | ${a.category} | ${a.startTime.toLocaleString()}`,
      );
    });
  }
};

// lets the user pick a filter type and shows matching activities
const handleFilterActivities = async () => {
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }

  const { filterType } = await inquirer.prompt([
    {
      type: "list",
      name: "filterType",
      message: "Filter by:",
      loop: false,
      choices: [
        { name: "Category", value: "category" },
        { name: "Day", value: "day" },
        new inquirer.Separator(),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (filterType === "category") {
    // let user pick which category to filter by
    const { category } = await inquirer.prompt([
      {
        type: "list",
        name: "category",
        message: "Select a category:",
        choices: ["food", "transport", "sightseeing"],
      },
    ]);
    const activities = await getActivitiesByCategory(currentTripId, category);
    if (activities.length === 0) {
      console.log(`\nNo ${category} activities found.`);
    } else {
      console.log(`\n--- ${category} Activities ---`);
      activities.forEach((a) => {
        console.log(
          `- ${a.name} | $${a.cost} | ${a.startTime.toLocaleString()}`,
        );
      });
    }
  } else if (filterType === "day") {
    // ask user for a date, or type "back" to return
    const { date } = await inquirer.prompt([
      {
        type: "input",
        name: "date",
        message: 'Enter a date (YYYY-MM-DD) or "back" to return:',
      },
    ]);

    if (date.toLowerCase() === "back") return;

    const activities = await getActivitiesByDay(currentTripId, new Date(date));
    if (activities.length === 0) {
      console.log(
        `\nNo activities found for ${date}. Check the date and try again.`,
      );
    } else {
      console.log(`\n--- Activities on ${date} ---`);
      activities.forEach((a) => {
        console.log(
          `- ${a.name} | $${a.cost} | ${a.category} | ${a.startTime.toLocaleString()}`,
        );
      });
    }
  }
};

// prompts for activity details and adds it to the list
const handleAddActivity = async () => {
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Activity name:",
    },
    {
      type: "number",
      name: "cost",
      message: "Cost ($):",
    },
    {
      type: "list",
      name: "category",
      message: "Category:",
      choices: ["food", "transport", "sightseeing"],
    },
    {
      type: "input",
      name: "startTime",
      message: "Start time (YYYY-MM-DDTHH:mm):",
    },
  ]);

  await addActivity(
    currentTripId,
    answers.name,
    answers.cost,
    answers.category,
    new Date(answers.startTime),
  );
  console.log(`\nActivity "${answers.name}" added!`);
};

// shows activities in the current trip and lets the user pick one to delete
const handleDeleteActivity = async () => {
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }

  const activities = await getActivitiesChronologically(currentTripId);
  if (activities.length === 0) {
    console.log("\nNo activities to delete.");
    return;
  }

  const { activityId } = await inquirer.prompt([
    {
      type: "list",
      name: "activityId",
      message: "Select an activity to delete:",
      loop: false,
      choices: [
        ...activities.map((a) => ({
          name: `${a.name} | $${a.cost} | ${a.category}`,
          value: a.id,
        })),
        new inquirer.Separator(),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (activityId === "back") return;

  await deleteActivity(currentTripId, activityId);
  console.log("\nActivity deleted!");
};

// prompts for trip details and creates a new trip
const handleCreateTrip = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "destination",
      message: "Destination (country/city):",
    },
    {
      type: "input",
      name: "startDate",
      message: "Start date (YYYY-MM-DD):",
    },
  ]);

  const tripId = await addTrip(
    answers.destination,
    new Date(answers.startDate),
  );
  console.log(`\nTrip to "${answers.destination}" created! (${tripId})`);
};

// shows all trips and lets the user pick one to work with
const handleSelectTrip = async () => {
  const trips = await getTrips();

  if (trips.length === 0) {
    console.log("\nNo trips found. Create one first!");
    return;
  }

  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select a trip:",
      loop: false,
      choices: trips.map((t) => ({
        name: `${t.destination} (${t.id})`,
        value: t.id,
      })),
    },
  ]);

  currentTripId = tripId;
  console.log(`\nNow working with trip: ${tripId}`);
};

// shows all trips and lets the user pick one to delete
const handleDeleteTrip = async () => {
  const trips = await getTrips();

  if (trips.length === 0) {
    console.log("\nNo trips to delete.");
    return;
  }

  const { tripId } = await inquirer.prompt([
    {
      type: "list",
      name: "tripId",
      message: "Select a trip to delete:",
      loop: false,
      choices: [
        ...trips.map((t) => ({
          name: `${t.destination} (${t.id})`,
          value: t.id,
        })),
        new inquirer.Separator(),
        { name: "Back", value: "back" },
      ],
    },
  ]);

  if (tripId === "back") return;

  await deleteTrip(tripId);

  // if we deleted the trip we were working with, clear the selection
  if (currentTripId === tripId) {
    currentTripId = null;
  }

  console.log(`\nTrip ${tripId} deleted!`);
};

// shows all trips
const handleViewTrips = async () => {
  const trips = await getTrips();

  if (trips.length === 0) {
    console.log("\nNo trips found. Create one first!");
    return;
  }

  console.log("\n--- Your Trips ---");
  trips.forEach((t) => {
    console.log(`- ${t.destination} (${t.id}) | ${t.activities.length} activities`);
  });
};

// gets the total cost of the trip from the budget service
const handleTripCost = async () => {
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }
  const total = await getTripTotalCost(currentTripId);
  console.log(`\nTrip total cost: $${total}`);
};

// asks user for a cost threshold and shows activities above it
const handleHighCost = async () => {
  const { threshold } = await inquirer.prompt([
    {
      type: "number",
      name: "threshold",
      message: "Enter cost threshold ($):",
    },
  ]);
  if (!currentTripId) {
    console.log("\nNo trip selected. Select a trip first!");
    return;
  }
  const items = await findHighCostItem(currentTripId, threshold);
  if (items.length === 0) {
    console.log(`\nNo activities found above $${threshold}.`);
  } else {
    console.log(`\n=== High Cost Activities (>= $${threshold}) ===`);
    console.log(`Found ${items.length} activities:\n`);
    items.forEach((a) => {
      console.log(`- ${a.name}: $${a.cost} (${a.category})`);
    });
  }
};

// asks for a country name and fetches info from the API
const handleDestinationInfo = async () => {
  const { country } = await inquirer.prompt([
    {
      type: "input",
      name: "country",
      message: 'Enter country name or "back" to return:',
    },
  ]);

  if (country.toLowerCase() === "back") return;

  try {
    const info = await getDestinationInfo(country);
    console.log(`\n--- Destination Info: ${country} ---`);
    console.log(`Currency: ${info.currency}`);
    console.log(`Flag: ${info.flag}`);
  } catch {
    console.log(
      "\nCould not fetch destination info. Check the country name and try again.",
    );
  }
};

// main function that runs the menu loop
const main = async () => {
  let running = true;

  while (running) {
    console.log("\n=== Travel Itinerary Manager ===");

    // show the main menu and wait for user to pick an option
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        loop: false,
        choices: [
          { name: "Create a new trip", value: "createtrip" },
          { name: "View all trips", value: "viewtrips" },
          { name: "Select a trip", value: "selecttrip" },
          { name: "Delete a trip", value: "deletetrip" },
          new inquirer.Separator("--- Activities ---"),
          { name: "View activities (chronological)", value: "view" },
          { name: "Filter activities", value: "filter" },
          { name: "Add a new activity", value: "add" },
          { name: "Delete an activity", value: "deleteactivity" },
          new inquirer.Separator("--- Budget ---"),
          { name: "View trip total cost", value: "cost" },
          { name: "Find high-cost activities", value: "highcost" },
          new inquirer.Separator("--- Info ---"),
          { name: "Get destination info", value: "destination" },
          new inquirer.Separator(),
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    // each case calls its own handler function to keep things clean
    switch (choice) {
      case "createtrip":
        await handleCreateTrip();
        break;
      case "viewtrips":
        await handleViewTrips();
        break;
      case "selecttrip":
        await handleSelectTrip();
        break;
      case "deletetrip":
        await handleDeleteTrip();
        break;
      case "view":
        await handleViewActivities();
        break;
      case "filter":
        await handleFilterActivities();
        break;
      case "add":
        await handleAddActivity();
        break;
      case "deleteactivity":
        await handleDeleteActivity();
        break;
      case "highcost":
        await handleHighCost();
        break;
      case "cost":
        await handleTripCost();
        break;
      case "destination":
        await handleDestinationInfo();
        break;
      case "exit":
        console.log("\nGoodbye!");
        running = false;
        break;
    }
  }
};

main();
