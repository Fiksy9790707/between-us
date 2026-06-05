export type Tag = string;

export type Profile = {
  names: {
    personA: string;
    personB: string;
  };
  startedAt: string;
  statement: string;
  coverImageUrl?: string;
};

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  tags: Tag[];
};

export type Photo = {
  id: string;
  date: string;
  title: string;
  alt: string;
  imageUrl: string;
  location: string;
  tags: Tag[];
};

export type Anniversary = {
  id: string;
  title: string;
  date: string;
  type: "anniversary" | "birthday" | "custom";
  recurring: "none" | "yearly";
  person?: string;
};

export type Gift = {
  id: string;
  title: string;
  date: string;
  scenario: string;
  reaction: string;
  imageUrl: string;
  price?: number;
  tags: Tag[];
};

export type WishItem = {
  id: string;
  title: string;
  category: "place" | "food" | "activity";
  description: string;
  status: "todo" | "done";
  targetDate?: string;
  imageUrl?: string;
};

export type LoveNote = {
  id: string;
  date: string;
  content: string;
  author?: string;
};

export type MemoryData = {
  profile: Profile;
  timeline: TimelineEvent[];
  photos: Photo[];
  anniversaries: Anniversary[];
  gifts: Gift[];
  wishes: WishItem[];
  notes: LoveNote[];
};

export function emptyMemoryData(profile: Profile): MemoryData {
  return {
    profile,
    timeline: [],
    photos: [],
    anniversaries: [],
    gifts: [],
    wishes: [],
    notes: []
  };
}
