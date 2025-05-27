import { ApiDateTimeArray } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatApiDateTime(dateTimeArray: ApiDateTimeArray | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!dateTimeArray) return "N/A";
  if (typeof dateTimeArray === 'string') {
    // If it's already a string (e.g. ISO string from form), try to format it
    try {
      return new Date(dateTimeArray).toLocaleString(undefined, options ?? {
        year: 'numeric', month: 'short', day: 'numeric',
        // hour: '2-digit', minute: '2-digit' // Uncomment if time is needed
      });
    } catch (e) {
      return dateTimeArray; // Return as is if parsing fails
    }
  }

  // Assuming [year, month, day, hour, minute, second, nano?]
  // Month is 1-indexed in the array from backend, but 0-indexed in JS Date constructor
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateTimeArray;
  try {
    return new Date(year, month - 1, day, hour, minute, second).toLocaleString(undefined, options ?? {
        year: 'numeric', month: 'short', day: 'numeric',
        // hour: '2-digit', minute: '2-digit' // Uncomment if time is needed
    });
  } catch (e) {
    console.error("Error formatting API date time array:", dateTimeArray, e);
    return "Invalid Date";
  }
}

export function formatApiDate(dateArray: ApiDateTimeArray | string | null | undefined): string {
  return formatApiDateTime(dateArray, { year: 'numeric', month: 'long', day: 'numeric' });
}