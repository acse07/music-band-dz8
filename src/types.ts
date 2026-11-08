export interface Profile {
  first_name: string;
  specialization: string;
  specialization_display: string;
  bio: string;
  fee: string;
}

export interface User {
  id: number;
  username: string;
  profile: Profile;
}

export interface Specialization {
  value: string;
  label: string;
}

export interface LoginResponse {
  access: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}


