// AI Tool Result Types

export interface SearchClass {
  _id: string;
  name: string;
  instructor: string;
  duration: number;
  tierLevel: "basic" | "performance" | "champion";
  category?: { name: string };
}

export interface SearchClassesResult {
  count: number;
  classes: SearchClass[];
}

export interface ClassSession {
  id: string;
  startTime: string;
  spotsAvailable: number;
  activity: {
    name: string;
    instructor: string;
    duration: number;
    tierLevel: string;
  };
  venue: {
    name: string;
    city: string;
  };
}

export interface GetClassSessionsResult {
  count: number;
  sessions: ClassSession[];
}

export interface SearchVenue {
  _id: string;
  name: string;
  description?: string;
  address?: {
    street?: string;
    city?: string;
    postcode?: string;
  };
  amenities?: string[];
}

export interface SearchVenuesResult {
  count: number;
  venues: SearchVenue[];
}

export interface UserBooking {
  id: string;
  status: string;
  bookedAt?: string;
  attendedAt?: string;
  class?: string;
  instructor?: string;
  duration?: number;
  dateTime?: string;
  venue?: string;
  city?: string;
}

export interface GetUserBookingsResult {
  count: number;
  type: "upcoming" | "past" | "all";
  bookings: UserBooking[];
  error?: string;
}

export interface GetRecommendationsResult {
  count: number;
  recommendations: SearchClass[];
  basedOn: {
    fitnessGoal?: string;
    preferredDuration?: number;
    tierLevel?: string;
  };
}

