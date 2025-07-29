import { format } from "date-fns";
import { id } from "date-fns/locale";

export const formattedDate = (date: Date) => {
  return format(date, 'EEEE, dd/MM/yyyy HH:mm', { locale: id });
}