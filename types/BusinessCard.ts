export interface BusinessCard {
  id: number;
  address: string;
  code: string;
  company: string;
  department: string;
  email: string;
  fax: string;
  first_name: string;
  home_phone: string;
  job_title: string;
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
  website: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  description?: string;
}

export interface BusinessCardResponse {
  attributes: BusinessCard
  id: string
  relationships: {
    tags: {
      data: TagResponse[]
    }
  }
  type: string
}

export interface TagResponse {
  attributes: Tag
  id: string
  type: string
}
export interface BusinessCardsResponse {
  data: BusinessCardResponse[]
  included: TagResponse[]
}


export interface GetBusinessCardResponse {
  data: BusinessCardResponse
  included: TagResponse[]
}


export interface PutBusinessCardResponse {

}
