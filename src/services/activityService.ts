import { Activity } from "../models";
import { randomUUID } from "crypto";
import { compareAsc } from "date-fns";
import dbData from "../../db.json";

let activities: Activity[] = dbData.trips[0].activities.map(activity => ({
    ...activity,
    startTime: new Date(activity.startTime),
    category: activity.category as "food" | "transport" | "sightseeing"
}));

export const addActivity = (
    name: string, 
    cost: number, 
    category: "food" | "transport" | "sightseeing", 
    startTime: Date 
): void => {

    const newActivity: Activity = {
        id: randomUUID(),
        name: name,
        cost: cost,
        category: category,
        startTime: startTime,
    }
    activities.push(newActivity)
};



export const getActivitiesByDay = (date: Date): Activity[] =>{
    const activitiesOnDay: Activity[] =  []
    for (const activity of activities){
        if (activity.startTime.toDateString() === date.toDateString() ){
            activitiesOnDay.push(activity)
        }
    }
    return activitiesOnDay;
};

export const getActivitiesByCategory = (category: "food" | "transport" | "sightseeing"): Activity[] =>{
    const filteredActivities: Activity[] =  []
    for (const activity of activities){
        if (activity.category === category ){
            filteredActivities.push(activity)
        }
    }
    return filteredActivities;
};

export const getActivitiesChronologically = (): Activity[] =>{
    return [...activities].sort((a, b ) =>{
        return compareAsc((a.startTime), (b.startTime))
    });
};

