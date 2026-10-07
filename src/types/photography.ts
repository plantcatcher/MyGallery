export interface Photo {
  id: string;
  url: string;
  thumbnail?: string;
  lqip?: string;
  title: string;
  description: string;
  category: string;
  project?: string;
  date: string;
  location: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  year: string;
}
