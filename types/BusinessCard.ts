export interface BusinessCard {
  name: string;
  email: string;
  frontImageUrl: string;
  backImageUrl: string;
  phone: string;
  tags: Tag[];
}

export interface Tag {
  name: string;
  color?: string;
}
