export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "Materials" | "Services" | "Equipment" | string;
  features: string[];
  specifications: Record<string, string>;
  image: string;
  gallery: string[];
  price?: number;
  status: "Visible" | "Hidden" | string;
  displayOrder: number;
}
