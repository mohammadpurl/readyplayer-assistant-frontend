import { ReactNode } from "react"
import { DateObject } from "react-multi-date-picker"

export interface NavItem {
  label: string
  icon: ReactNode // Assuming icon is a ReactNode (could be JSX.Element or any other suitable type)
  ariaLabel: string
  content: ReactNode // Assuming content is a ReactNode (could be JSX.Element or any other suitable type)
}

export interface Passenger {
  fullName: string;
  nationalId: string;
  luggageCount: number;
}

export interface TicketInfo {
  airportName?: string;
  flightType?: "ورودی" | "خروجی";
  travelDate?: string | DateObject | null;
  flightNumber?: string;
  passengers: Passenger[];
}