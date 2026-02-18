import { Activity } from "../models";
import { randomUUID } from "crypto";
import { compareAsc } from "date-fns";
import fs from "fs/promises";
import { readDataBase } from "./budgetManager";

// reads activities for a specific trip from db.json
const getActivitiesForTrip = async (tripId: string): Promise<Activity[]> => {
    const db = await readDataBase();
    const trip = db.trips.find(t => t.id === tripId);

    if (!trip) {
        throw new Error(`Trip ${tripId} not found`);
    }

    return trip.activities.map(a => ({
        ...a,
        startTime: new Date(a.startTime),
    }));
};

export const addActivity = async (
    tripId: string,
    name: string,
    cost: number,
    category: "food" | "transport" | "sightseeing",
    startTime: Date
): Promise<void> => {

    const newActivity: Activity = {
        id: randomUUID(),
        name: name,
        cost: cost,
        category: category,
        startTime: startTime,
    }

    // read db, find the trip, push the activity, write back
    const db = await readDataBase();
    const trip = db.trips.find(t => t.id === tripId);

    if (!trip) {
        throw new Error(`Trip ${tripId} not found`);
    }

    trip.activities.push(newActivity);
    await fs.writeFile("./db.json", JSON.stringify(db, null, 2));
};

export const deleteActivity = async (tripId: string, activityId: string): Promise<void> => {
    const db = await readDataBase();
    const trip = db.trips.find(t => t.id === tripId);

    if (!trip) {
        throw new Error(`Trip ${tripId} not found`);
    }

    trip.activities = trip.activities.filter(a => a.id !== activityId);
    await fs.writeFile("./db.json", JSON.stringify(db, null, 2));
};

export const getActivitiesByDay = async (tripId: string, date: Date): Promise<Activity[]> => {
    const activities = await getActivitiesForTrip(tripId);
    const activitiesOnDay: Activity[] = []
    for (const activity of activities){
        if (activity.startTime.toDateString() === date.toDateString() ){
            activitiesOnDay.push(activity)
        }
    }
    return activitiesOnDay;
};

export const getActivitiesByCategory = async (tripId: string, category: "food" | "transport" | "sightseeing"): Promise<Activity[]> => {
    const activities = await getActivitiesForTrip(tripId);
    const filteredActivities: Activity[] = []
    for (const activity of activities){
        if (activity.category === category ){
            filteredActivities.push(activity)
        }
    }
    return filteredActivities;
};

export const getActivitiesChronologically = async (tripId: string): Promise<Activity[]> => {
    const activities = await getActivitiesForTrip(tripId);
    return [...activities].sort((a, b) => {
        return compareAsc((a.startTime), (b.startTime))
    });
};
