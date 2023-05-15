import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const getTommorow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
};

export const isDay = (startDay: string, endDay: string): boolean => {
  const [hoursStart, minutesStart] = startDay.split("T")[1].split(":").map(Number);
  const [hoursEnd, minutesEnd] = endDay.split("T")[1].split(":").map(Number);
  const [hoursNow, minutesNow] = new Date().toLocaleTimeString("fr-FR").split(":").map(Number);
  return (
    (hoursStart < hoursNow && hoursNow < hoursEnd) ||
    (hoursStart === hoursNow && minutesStart < minutesNow) ||
    (hoursNow === hoursEnd && minutesNow < minutesEnd)
  );
};

export const SecondsToCron = (seconds: number): string => {
  if (seconds < 0) {
    throw new Error("Seconds cannot be negative");
  }
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const cron = `${seconds % 60} ${minutes % 60} ${hours % 24} * * *`;
  return cron;
};

// check if the deadline is correct (from backend startDay sera du type "HH:mm:ss")
export const checkDeadline = (date: Date, startDay: Date): boolean => {
  const nowDateFr: string = format(new Date(), "dd/MM/yyyy", { locale: fr });
  const nowTimeFr: string = format(new Date(), "HH:mm:ss", { locale: fr });
  const dateFr: string = format(new Date(date), "dd/MM/yyyy", { locale: fr });

  if (nowDateFr === dateFr) {
    const [hours, minutes, seconds] = nowTimeFr.split(":").map(Number);
    const hoursDeadline: number = startDay.getUTCHours();
    const minutesDeadline: number = startDay.getUTCMinutes();
    const secondsDeadline: number = startDay.getUTCSeconds();

    return (
      hours < hoursDeadline ||
      (hours === hoursDeadline && minutes < minutesDeadline) ||
      (hours === hoursDeadline && minutes === minutesDeadline && seconds < secondsDeadline)
    );
  } else {
    return date > new Date();
  }
};

export const addOffset = (hour: number, offset: number): number => {
  const newHour = hour + offset;
  return newHour > 23 ? newHour - 24 : newHour < 0 ? newHour + 24 : newHour;
};
