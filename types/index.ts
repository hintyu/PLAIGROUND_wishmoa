// 타입 정의

export type ProjectStatus = 'active' | 'hidden' | 'deleted';
export type ItemStatus = 'active' | 'hidden' | 'completed' | 'deleted';
export type DonationStatus = 'pending' | 'confirmed' | 'deleted';

export interface Project {
  project_id: string;
  user_id: string;
  project_title: string;
  project_subtitle: string;
  account_bank: string;
  account_number: string;
  account_holder: string;
  project_status: ProjectStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  item_id: string;
  project_id: string;
  item_title: string;
  item_url: string;
  item_image: string | null;
  item_price: number;
  item_status: ItemStatus;
  item_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface Donation {
  donation_id: string;
  item_id: string;
  donator_nm: string;
  donator_message: string | null;
  donation_amount: number;
  donation_status: DonationStatus;
  created_at: Date;
}

