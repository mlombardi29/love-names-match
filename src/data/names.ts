export const POPULAR_GIRL_NAMES = [
  "Olivia", "Emma", "Charlotte", "Amelia", "Sofia", "Isabella", "Ava", "Mia", "Evelyn", "Luna",
  "Harper", "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett",
  "Emily", "Aria", "Penelope", "Chloe", "Layla", "Mila", "Nora", "Hazel", "Madison", "Ellie",
  "Lily", "Nova", "Isla", "Grace", "Violet", "Aurora", "Riley", "Zoey", "Willow", "Emilia",
  "Stella", "Zoe", "Victoria", "Hannah", "Addison", "Leah", "Lucy", "Eliana", "Ivy", "Everly",
  "Lillian", "Paisley", "Elena", "Naomi", "Maya", "Natalie", "Kinsley", "Delilah", "Claire", "Audrey",
  "Aaliyah", "Ruby", "Brooklyn", "Alice", "Aubrey", "Autumn", "Leilani", "Savannah", "Valentina", "Kennedy",
  "Madelyn", "Josephine", "Bella", "Skylar", "Genesis", "Sophie", "Hailey", "Sadie", "Natalia", "Quinn",
  "Caroline", "Allison", "Gabriella", "Anna", "Serenity", "Nevaeh", "Cora", "Ariana", "Emery", "Lydia",
  "Jade", "Sarah", "Eva", "Adeline", "Madeline", "Piper", "Rylee", "Athena", "Peyton", "Everleigh"
];

export const POPULAR_BOY_NAMES = [
  "Liam", "Noah", "Oliver", "James", "Elijah", "William", "Henry", "Lucas", "Benjamin", "Theodore",
  "Mateo", "Levi", "Sebastian", "Daniel", "Jack", "Michael", "Alexander", "Owen", "Asher", "Samuel",
  "Ethan", "Leo", "Jackson", "Mason", "Ezra", "John", "Hudson", "Luka", "Aiden", "Joseph",
  "David", "Jacob", "Logan", "Luke", "Julian", "Gabriel", "Grayson", "Wyatt", "Matthew", "Maverick",
  "Dylan", "Isaac", "Elias", "Anthony", "Thomas", "Jayden", "Carter", "Santiago", "Ezekiel", "Charles",
  "Josiah", "Caleb", "Cooper", "Lincoln", "Miles", "Christopher", "Nathan", "Isaiah", "Kai", "Joshua",
  "Andrew", "Angel", "Adrian", "Cameron", "Nolan", "Waylon", "Jaxon", "Roman", "Eli", "Wesley",
  "Aaron", "Ian", "Christian", "Ryan", "Leonardo", "Brooks", "Axel", "Walker", "Jonathan", "Easton",
  "Everett", "Weston", "Bennett", "Robert", "Jameson", "Landon", "Silas", "Jose", "Beau", "Micah",
  "Colton", "Jordan", "Jeremiah", "Parker", "Greyson", "Rowan", "Adam", "Nicholas", "Theo", "Xavier"
];

export interface BabyName {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  isCustom?: boolean;
}

export const createNameDatabase = (): BabyName[] => {
  const girlNames = POPULAR_GIRL_NAMES.map((name, index) => ({
    id: `girl-${index}`,
    name,
    gender: 'girl' as const,
  }));

  const boyNames = POPULAR_BOY_NAMES.map((name, index) => ({
    id: `boy-${index}`,
    name,
    gender: 'boy' as const,
  }));

  return [...girlNames, ...boyNames];
};