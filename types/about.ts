export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutStats {
  id: string;
  number: string;
  label: string;
  description: string;
}

export interface AboutMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
}
