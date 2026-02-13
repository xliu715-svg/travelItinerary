import { Activity } from "../models";
import { randomUUID } from "crypto";
import { compareAsc } from "date-fns";

let activities: Activity[] = [];

const addActivity = (
    name: string, 
    cost: number, 
    category: "food" | "transport" | "sightseeing", 
    startTime: Date 
): void => {

    const newActivity = {
        id: randomUUID(),
        name: name,
        cost: cost,
        category: category,
        startTime: startTime,
    }
    activities.push(newActivity)
};

const getActivitiesByDay = (date: Date): Activity[] =>{
    const activitiesOnDay: Activity[] =  []
    for (const activity of activities){
        if (activity.startTime.toDateString() === date.toDateString() ){
            activitiesOnDay.push(activity)
        }
    }
    return activitiesOnDay;
};

const getActivitiesByCategory = (category: "food" | "transport" | "sightseeing"): Activity[] =>{
    const filteredActivities: Activity[] =  []
    for (const activity of activities){
        if (activity.category === category ){
            filteredActivities.push(activity)
        }
    }
    return filteredActivities;
};


//addActivity();
//getActivitiesByDay();
//getActivitiesByCategory();
//getAllCategoriesChronologically *