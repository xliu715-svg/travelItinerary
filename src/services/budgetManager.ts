import fs from "fs/promises";
import { Trip } from "../models";
import { Activity } from "../models";

// Read data from the DB.json file
export const readDataBase = async (): Promise<{ trips: Trip[] }> => {
  try {
    const response = await fs.readFile("./db.json", "utf-8");
    const data = JSON.parse(response) as { trips: Trip[] };
    return data;
  } catch (error) {
    throw new Error(`Failed to read database: ${(error as Error).message}`);
  }
};

// Make the calculate total cost function
export const calculateTotalCost = (trip: Trip): number => {
  return trip.activities.reduce((sum, activity) => sum + activity.cost, 0);
};

// Get total cost
export const getTripTotalCost = async (tripId: string): Promise<number> => {
  const db = await readDataBase();
  const trip = db.trips.find((t) => t.id === tripId);

  if (!trip) {
    throw new Error("Trip not found!");
  }

  return calculateTotalCost(trip);
};

// Find high cost activity item
export const findHighCostItem = async (
  tripId: string,
  threshold: number,
): Promise<Activity[]> => {
  const db = await readDataBase();
  const trip = db.trips.find((t) => t.id === tripId);

  if (!trip) {
    throw new Error("Trip not found!");
  }

  return trip.activities.filter((activity) => activity.cost >= threshold);
};
