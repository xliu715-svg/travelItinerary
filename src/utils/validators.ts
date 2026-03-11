import { isValid, parseISO } from "date-fns";

// Checks YYYY-MM-DD format strictly
export const isValidDateString = (input: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  return isValid(parseISO(input));
};

// Checks YYYY-MM-DDTHH:mm format strictly
export const isValidDateTimeString = (input: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return false;
  return isValid(parseISO(input));
};

// Checks that a number is finite and greater than zero
export const isPositiveNumber = (value: number | undefined): boolean => {
  if (value === undefined) return false;
  return Number.isFinite(value) && value > 0;
};

// Checks that a string is not empty or just whitespace
export const isNonEmptyString = (value: string): boolean => {
  return value.trim().length > 0;
};

// Checks that a date falls within a range (end date is optional)
export const isDateInRange = (date: Date, start: Date, end?: Date): boolean => {
  if (date < start) return false;
  if (end && date > end) return false;
  return true;
};
