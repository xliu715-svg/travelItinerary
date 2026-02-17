import inquirer from "inquirer";
import {
  getActivitiesChronologically,
  getActivitiesByCategory,
  getActivitiesByDay,
  addActivity,
} from "./services/activityService";
import { getTripTotalCost, findHighCostItem } from "./services/budgetManager";
import { getDestinationInfo } from "./services/destinationService";

// shows all activities sorted by time
const handleViewActivities = () => {
  const activities = getActivitiesChronologically();
  if (activities.length === 0) {
    console.log("\nNo activities found.");
  } else {
    console.log("\n--- Activities (Chronological) ---");
    activities.forEach((a) => {
      console.log(
        `- ${a.name} | $${a.cost} | ${a.category} | ${a.startTime.toLocaleString()}`
      );
    });
  }
};

// lets the user pick a filter type and shows matching activities
const handleFilterActivities = async () => {
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
    const activities = getActivitiesByCategory(category);
    if (activities.length === 0) {
      console.log(`\nNo ${category} activities found.`);
    } else {
      console.log(`\n--- ${category} Activities ---`);
      activities.forEach((a) => {
        console.log(
          `- ${a.name} | $${a.cost} | ${a.startTime.toLocaleString()}`
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

    const activities = getActivitiesByDay(new Date(date));
    if (activities.length === 0) {
      console.log(`\nNo activities found for ${date}. Check the date and try again.`);
    } else {
      console.log(`\n--- Activities on ${date} ---`);
      activities.forEach((a) => {
        console.log(
          `- ${a.name} | $${a.cost} | ${a.category} | ${a.startTime.toLocaleString()}`
        );
      });
    }
  }
};

// prompts for activity details and adds it to the list
const handleAddActivity = async () => {
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
    answers.name,
    answers.cost,
    answers.category,
    new Date(answers.startTime)
  );
  console.log(`\nActivity "${answers.name}" added!`);
};

// gets the total cost of the trip from the budget service
const handleTripCost = async () => {
  const total = await getTripTotalCost("trip_001");
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
  const items = await findHighCostItem("trip_001", threshold);
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
    console.log("\nCould not fetch destination info. Check the country name and try again.");
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
          { name: "View activities (chronological)", value: "view" },
          { name: "Filter activities", value: "filter" },
          { name: "Add a new activity", value: "add" },
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
      case "view":
        handleViewActivities();
        break;
      case "filter":
        await handleFilterActivities();
        break;
      case "add":
        await handleAddActivity();
        break;
      case "cost":
        await handleTripCost();
        break;
      case "highcost":
        await handleHighCost();
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
