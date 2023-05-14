import { format } from "date-fns";
import { fr } from "date-fns/locale";
export const parseDeadline = (deadline: string, startDay: string): string => {
  const deadlineDate = format(new Date(deadline), "dd/MM/yyyy", { locale: fr });
  const [hours, minutes] = startDay.split("T")[1].split(":").map(String);
  return deadlineDate + " at " + hours + "h" + minutes;
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
