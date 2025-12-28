import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateDisplay(dateString: string | undefined): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function convertDisplayDateToISO(displayDate: string): string {
  if (!displayDate) return "";
  
  const parts = displayDate.split("/");
  if (parts.length !== 3) return "";
  
  const [day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}`);
  
  if (isNaN(date.getTime())) return "";
  
  return date.toISOString().split('T')[0];
}