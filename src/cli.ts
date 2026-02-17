import inquirer from "inquirer";
import {
  getActivitiesChronologically,
  getActivitiesByCategory,
  getActivitiesByDay,
} from "./services/activityService";

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
    // ask user for a date to filter by
    const { date } = await inquirer.prompt([
      {
        type: "input",
        name: "date",
        message: "Enter a date (YYYY-MM-DD):",
      },
    ]);
    const activities = getActivitiesByDay(new Date(date));
    if (activities.length === 0) {
      console.log(`\nNo activities found for ${date}.`);
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
      case "exit":
        console.log("\nGoodbye!");
        running = false;
        break;
    }
  }
};

main();
