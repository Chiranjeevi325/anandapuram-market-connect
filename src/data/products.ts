export interface Product {
  id: string;
  name: string;
  nameLocal: string;
  category: 'flowers' | 'vegetables';
  image: string;
  additionalImages?: string[];
  description?: string;
  wholesalePrice: { min: number; max: number; unit: string };
  retailPrice: { min: number; max: number; unit: string };
  vendor: string;
  vendorLocation: string;
  rating: number;
  tags: string[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1', name: 'Marigold', nameLocal: 'Banti Puvvu',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=400&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1598187079731-04acaf155217?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1612363148951-0719bf92361c?w=600&h=400&fit=crop',
    ],
    description: 'Premium quality Marigold flowers freshly harvested from Gambhiram farms. These bright golden-orange blooms are perfect for temple decorations, wedding garlands, and festivals. Available in both loose and garland form. Our marigolds are pesticide-free and hand-picked at dawn for maximum freshness and fragrance.',
    wholesalePrice: { min: 40, max: 120, unit: 'per KG' },
    retailPrice: { min: 10, max: 20, unit: 'small bunch' },
    vendor: 'Ramesh Farm', vendorLocation: 'Gambhiram',
    rating: 4.8, tags: ['Wholesale', 'Daily Fresh'], inStock: true,
  },
  {
    id: '2', name: 'Jasmine', nameLocal: 'Malle Puvvu',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400&h=400&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=400&fit=crop',
    ],
    description: 'Fragrant Jasmine flowers from Turlavada\'s finest gardens. Known for their intoxicating aroma, these white blossoms are ideal for hair garlands, pooja offerings, and perfumery. Priced per Moora (traditional weight unit). Harvested before sunrise to preserve their delicate scent.',
    wholesalePrice: { min: 150, max: 600, unit: 'per Moora' },
    retailPrice: { min: 20, max: 50, unit: 'small string' },
    vendor: 'Lakshmi Gardens', vendorLocation: 'Turlavada',
    rating: 4.9, tags: ['Wholesale', 'Seasonal'], inStock: true,
  },
  {
    id: '3', name: 'Rose', nameLocal: 'Roja Puvvu',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=400&fit=crop',
    additionalImages: [
      'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=400&fit=crop',
    ],
    description: 'Fresh roses in vibrant red, pink, and yellow varieties. Sourced directly from Suresh Flowers at Anandapuram Junction. Perfect for bouquets, event decorations, and religious ceremonies. Each stem is carefully selected for uniform bloom size and freshness.',
    wholesalePrice: { min: 80, max: 250, unit: 'per KG' },
    retailPrice: { min: 15, max: 40, unit: 'per piece' },
    vendor: 'Suresh Flowers', vendorLocation: 'Anandapuram Junction',
    rating: 4.6, tags: ['Daily Fresh'], inStock: true,
  },
  {
    id: '4', name: 'Chrysanthemum', nameLocal: 'Chamanthi',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=400&fit=crop',
    description: 'Colourful Chrysanthemum blooms from Venkat Nursery in Gambhiram. Available in white, yellow, and purple. Excellent vase life makes them a top choice for home décor and mandap decorations. Grown using sustainable farming practices.',
    wholesalePrice: { min: 60, max: 200, unit: 'per KG' },
    retailPrice: { min: 30, max: 50, unit: 'small bunch' },
    vendor: 'Venkat Nursery', vendorLocation: 'Gambhiram',
    rating: 4.7, tags: ['Wholesale'], inStock: true,
  },
  {
    id: '5', name: 'Lily', nameLocal: 'Lilli Puvvu',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=400&h=400&fit=crop',
    description: 'Elegant Lily flowers from Sita Florals, Turlavada. Their large, trumpet-shaped petals and sweet fragrance make them perfect for premium bouquets and special occasions. Available in white and light pink varieties.',
    wholesalePrice: { min: 100, max: 350, unit: 'per KG' },
    retailPrice: { min: 25, max: 60, unit: 'per piece' },
    vendor: 'Sita Florals', vendorLocation: 'Turlavada',
    rating: 4.5, tags: ['Daily Fresh'], inStock: true,
  },
  {
    id: '6', name: 'Tomato', nameLocal: 'Tamata',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=400&fit=crop',
    description: 'Farm-fresh tomatoes from Anandapuram Junction. Firm, vine-ripened, and perfect for curries, chutneys, and salads. Sourced directly from Raju Vegetables — no cold storage, ensuring peak flavour and nutrition.',
    wholesalePrice: { min: 20, max: 60, unit: 'per KG' },
    retailPrice: { min: 30, max: 80, unit: 'per KG' },
    vendor: 'Raju Vegetables', vendorLocation: 'Anandapuram Junction',
    rating: 4.4, tags: ['Daily Fresh'], inStock: true,
  },
  {
    id: '7', name: 'Brinjal', nameLocal: 'Vankaya',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=400&fit=crop',
    description: 'Fresh purple brinjal from Krishna Farm, Gambhiram. Perfect for the classic Andhra-style Gutti Vankaya Kura. Firm, glossy, and hand-picked each morning. Available in both large and small (Ravva Vankaya) varieties.',
    wholesalePrice: { min: 15, max: 50, unit: 'per KG' },
    retailPrice: { min: 25, max: 60, unit: 'per KG' },
    vendor: 'Krishna Farm', vendorLocation: 'Gambhiram',
    rating: 4.3, tags: ['Wholesale', 'Daily Fresh'], inStock: true,
  },
  {
    id: '8', name: 'Green Chilli', nameLocal: 'Mirchi',
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=400&fit=crop',
    description: 'Fiery green chillies from Padma Organics, Turlavada. Grown organically without chemical pesticides. Ideal for pickles, curries, and tempering. Consistent heat level and bright green colour guaranteed.',
    wholesalePrice: { min: 30, max: 100, unit: 'per KG' },
    retailPrice: { min: 40, max: 120, unit: 'per KG' },
    vendor: 'Padma Organics', vendorLocation: 'Turlavada',
    rating: 4.6, tags: ['Daily Fresh'], inStock: true,
  },
];

export const dailyPrices = [
  { name: 'Marigold (Banti)', price: '₹85/KG', trend: 'up' as const },
  { name: 'Jasmine (Malle)', price: '₹320/Moora', trend: 'down' as const },
  { name: 'Rose (Roja)', price: '₹150/KG', trend: 'up' as const },
  { name: 'Chrysanthemum', price: '₹130/KG', trend: 'stable' as const },
  { name: 'Lily', price: '₹200/KG', trend: 'up' as const },
  { name: 'Tomato', price: '₹45/KG', trend: 'down' as const },
  { name: 'Brinjal', price: '₹35/KG', trend: 'stable' as const },
  { name: 'Green Chilli', price: '₹70/KG', trend: 'up' as const },
];
