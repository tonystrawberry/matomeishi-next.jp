export interface BusinessCard {
  id: string;
  code: string;
  company: string;
  email: string;
  fax: string;
  first_name: string;
  home_phone: string;
  last_name: string;
  meeting_date: string;
  mobile_phone: string;
  notes: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  front_image_url: string;
  back_image_url: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}
