import { Message, TicketInfo } from "@/types/type";


export async function sendUserMessage(message: string) {
  try {
    
    console.log(
      "process.env.NEXT_PUBLIC_API_URL",
      process.env.NEXT_PUBLIC_API_URL,
    );
    
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured. Please set it in your .env.local file.");
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/aiassistant/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({message}), // فقط آرایه
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get response from backend");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error asking question:", error);
    throw error;
  }
}

export async function saveConversation(
  messages: Array<{ id: string; sender: string; content: string }>,
) {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured. Please set it in your .env.local file.");
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/batch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages), // فقط آرایه
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save conversation");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
}

export async function extractPassengerDataWithOpenAI(messages: Message[]) {
  const response = await fetch("/api/extract-passenger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) throw new Error("Failed to extract passenger data");

  return await response.json();
}

export async function saveTrip(tripData: TicketInfo) {
  console.log(`process.env.NEXT_PUBLIC_API_URL ${process.env.NEXT_PUBLIC_API_URL}`)
  
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured. Please set it in your .env.local file.");
  }
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/trips/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tripData),
  });

  if (!res.ok) throw new Error("Failed to save trip");

  return await res.json(); // فرض: خروجی شامل id یا tripId است
}

export async function fetchTrip(tripId: string) {

  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL environment variable is not configured. Please set it in your .env.local file.");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/trips/${tripId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch trip data");
  return await res.json();
}
