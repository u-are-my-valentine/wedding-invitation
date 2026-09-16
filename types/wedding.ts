export interface FamilyMember {
  name: string;
  deceased?: boolean;
  phone?: string;
}

export interface Person {
  name: string;
  phone?: string;
  father?: FamilyMember;
  mother?: FamilyMember;
}

export interface Account {
  label: string;
  holder: string;
  bank: string;
  number: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface TransportItem {
  label: string;
  description: string;
}

export interface WeddingConfig {
  couple: { groom: Person; bride: Person };
  wedding: {
    date: string;
    time: string;
    durationMinutes: number;
    venueName: string;
    hallName?: string;
    address: string;
    lotAddress?: string;
    mapUrl?: string;
  };
  invitation: { eyebrow: string; title: string; message: string[] };
  gallery: GalleryImage[];
  transport: TransportItem[];
  accounts: { groom: Account[]; bride: Account[] };
  features: { rsvp: boolean; guestbook: boolean; music: boolean };
  share: { title: string; description: string; image: string };
  searchEngineIndex: boolean;
}
