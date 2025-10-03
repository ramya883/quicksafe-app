export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface SafeLocation {
  id: string;
  latitude: number;
  longitude: number;
  type: 'police' | 'hospital' | 'safe_space' | 'well_lit';
  description: string;
  reported_by?: string;
  created_at: string;
}

export interface HotlineResource {
  id: string;
  name: string;
  phone: string;
  description: string;
  available: string;
}

export interface SafetyCheckIn {
  id: string;
  user_id: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'missed';
  location?: {
    latitude: number;
    longitude: number;
  };
}
