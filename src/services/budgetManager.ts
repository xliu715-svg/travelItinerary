import fs from "fs/promises";
import { Trip } from "../models";
import { Activity } from "../models";

//read data from the DB.json file
export const readDataBase = async (): Promise<{ trips: Trip[] }> => {
  try {
    const response = await fs.readFile("./db.json", "utf-8");
    const data = JSON.parse(response);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//make the calculate total cost function
export const calculateTotalCost = (trip: Trip): number => {
  return trip.activities.reduce((sum, activity) => sum + activity.cost, 0);
};

//get total cost
export const getTripTotalCost = async (tripId: string): Promise<number> => {
  try {
    const db = await readDataBase();
    const trip = db.trips.find((t) => t.id === tripId);

    if (!trip) {
      throw new Error("Trip not found!");
    }

    return calculateTotalCost(trip);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//test
// const test = async () => {
//   const total = await getTripTotalCost("trip_001");
//   console.log(`Total cost: ${total}`);
// };
// test();

//find high cost activity item
export const findHighCostItem = async (
  tripId: string,
  threshold: number,
): Promise<Activity[]> => {
  try {
    const db = await readDataBase();
    const trip = db.trips.find((t) => t.id === tripId);

    if (!trip) {
      throw new Error("Trip not found!");
    }

    const highCostItem = trip.activities.filter(
      (activity) => activity.cost >= threshold,
    );

    return highCostItem;
  } catch (error) {
    console.error(error);
    throw Error;
  }
};

// Presentation to the users in a friendly way

export const highCost = async (tripId: string, threshold: number) => {
  try {
    const expensive = await findHighCostItem(tripId, threshold);

    console.log(`\n=== High Cost Activities (=> $${threshold}) ===`);
    console.log(`Found ${expensive.length} expensive activities:\n`);

    expensive.forEach((activity) => {
      console.log(
        `- ${activity.name}: $${activity.cost} (${activity.category})`,
      );
    });
  } catch (error) {}
};

//Test
// const testHighCost = async () => {
//   const expensive = await highCost("trip_001", 30);
//   return expensive;
// };

// testHighCost().then((result) => console.log(result));
