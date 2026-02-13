export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  project?: string;
  date: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  year: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
  role: "user" | "admin";
  created_at?: string;
  updated_at?: string;
}
