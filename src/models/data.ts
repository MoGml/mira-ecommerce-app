// Data models for the Mira shopping app

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  categoryId: string;
  subCategoryId: string;
  description?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  uom?: string; // Unit of measure (e.g., "KG", "Piece", "Pack")
  uomValue?: number; // Value (e.g., 1, 2, 500)
  promotionalMessages?: string[]; // Array of promotional messages
  badge?: 'best-seller' | 'combo'; // Product badges
  soldCount?: number; // Number of items sold recently
}

export interface Category {
  id: string;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  productCount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  shipmentType: 'express' | 'scheduled';
  selectedOptions?: string; // For editable options like size, weight, etc.
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  walletBalance?: number;
}

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Work"
  street: string;
  city: string;
  building?: string;
  floor?: string;
  apartment?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'cash' | 'apple-pay' | 'wallet';
  lastFourDigits?: string;
  isDefault: boolean;
}

export interface Shipment {
  id: string;
  type: 'express' | 'scheduled';
  items: CartItem[];
  deliverySlot?: string; // e.g., "8:00 PM – 10:00 PM"
  deliveryDate?: string;
  subtotal: number;
  deliveryFee: number;
}

export interface Order {
  id: string;
  userId: string;
  shipments: Shipment[];
  address: Address;
  receiverName: string;
  receiverPhone: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  promoDiscount?: number;
  deliveryTip: number;
  walletUsed: number;
  subtotal: number;
  totalDeliveryFees: number;
  total: number;
  status: 'pending' | 'confirmed' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
}

// Sample data
// Grouped categories structure to match Figma design
export interface CategoryGroup {
  id: string;
  title: string;
  categories: Category[];
}

// Real product images from assets
const productImages = [
  'https://i.imgur.com/cu2aB5V.png', // Tasali Chips
  'https://i.imgur.com/XMLmQpy.png', // Almarai Milk
];

// Helper function to get random product image
const getRandomProductImage = (): string => {
  return productImages[Math.floor(Math.random() * productImages.length)];
};

export const categoryGroups: CategoryGroup[] = [
  {
    id: 'group1',
    title: 'Veggies & Fruits',
    categories: [
      {
        id: '1',
        name: 'Vegetables',
        image: 'https://via.placeholder.com/120x120/4CAF50/FFFFFF?text=Veg',
        subCategories: [
          { id: '1-1', name: 'All', categoryId: '1', productCount: 25 },
          { id: '1-2', name: 'Leafy Greens', categoryId: '1', productCount: 8 },
          { id: '1-3', name: 'Root Vegetables', categoryId: '1', productCount: 12 },
          { id: '1-4', name: 'Peppers', categoryId: '1', productCount: 5 },
        ]
      },
      {
        id: '2',
        name: 'Fruits',
        image: 'https://via.placeholder.com/120x120/FF9800/FFFFFF?text=Fruit',
        subCategories: [
          { id: '2-1', name: 'All', categoryId: '2', productCount: 30 },
          { id: '2-2', name: 'Citrus', categoryId: '2', productCount: 8 },
          { id: '2-3', name: 'Berries', categoryId: '2', productCount: 12 },
          { id: '2-4', name: 'Tropical', categoryId: '2', productCount: 10 },
        ]
      },
      {
        id: '3',
        name: 'Leaves',
        image: 'https://via.placeholder.com/120x120/8BC34A/FFFFFF?text=Leaf',
        subCategories: [
          { id: '3-1', name: 'All', categoryId: '3', productCount: 15 },
          { id: '3-2', name: 'Lettuce', categoryId: '3', productCount: 5 },
          { id: '3-3', name: 'Spinach', categoryId: '3', productCount: 4 },
          { id: '3-4', name: 'Herbs', categoryId: '3', productCount: 6 },
        ]
      },
    ]
  },
  {
    id: 'group2',
    title: 'Frozen',
    categories: [
      {
        id: '4',
        name: 'Vegetables',
        image: 'https://via.placeholder.com/120x120/2196F3/FFFFFF?text=FVeg',
        subCategories: [
          { id: '4-1', name: 'All', categoryId: '4', productCount: 20 },
          { id: '4-2', name: 'Mixed Vegetables', categoryId: '4', productCount: 8 },
          { id: '4-3', name: 'Corn', categoryId: '4', productCount: 6 },
          { id: '4-4', name: 'Peas', categoryId: '4', productCount: 6 },
        ]
      },
      {
        id: '5',
        name: 'Fruits',
        image: 'https://via.placeholder.com/120x120/E91E63/FFFFFF?text=FFruit',
        subCategories: [
          { id: '5-1', name: 'All', categoryId: '5', productCount: 18 },
          { id: '5-2', name: 'Berries', categoryId: '5', productCount: 8 },
          { id: '5-3', name: 'Peaches', categoryId: '5', productCount: 5 },
          { id: '5-4', name: 'Mango', categoryId: '5', productCount: 5 },
        ]
      },
      {
        id: '6',
        name: 'French fries',
        image: 'https://via.placeholder.com/120x120/FF5722/FFFFFF?text=Fries',
        subCategories: [
          { id: '6-1', name: 'All', categoryId: '6', productCount: 12 },
          { id: '6-2', name: 'Regular', categoryId: '6', productCount: 6 },
          { id: '6-3', name: 'Sweet Potato', categoryId: '6', productCount: 3 },
          { id: '6-4', name: 'Waffle', categoryId: '6', productCount: 3 },
        ]
      },
      {
        id: '7',
        name: 'Chicken',
        image: 'https://via.placeholder.com/120x120/795548/FFFFFF?text=Chicken',
        subCategories: [
          { id: '7-1', name: 'All', categoryId: '7', productCount: 15 },
          { id: '7-2', name: 'Breast', categoryId: '7', productCount: 5 },
          { id: '7-3', name: 'Wings', categoryId: '7', productCount: 5 },
          { id: '7-4', name: 'Thighs', categoryId: '7', productCount: 5 },
        ]
      },
    ]
  },
  {
    id: 'group3',
    title: 'Milk & Egg',
    categories: [
      {
        id: '8',
        name: 'Fresh Milk',
        image: 'https://via.placeholder.com/120x120/FFF3E0/333333?text=Milk',
        subCategories: [
          { id: '8-1', name: 'All', categoryId: '8', productCount: 12 },
          { id: '8-2', name: 'Whole Milk', categoryId: '8', productCount: 4 },
          { id: '8-3', name: 'Low Fat', categoryId: '8', productCount: 4 },
          { id: '8-4', name: 'Skim', categoryId: '8', productCount: 4 },
        ]
      },
      {
        id: '9',
        name: 'Long life milk',
        image: 'https://via.placeholder.com/120x120/E8F5E8/333333?text=LongMilk',
        subCategories: [
          { id: '9-1', name: 'All', categoryId: '9', productCount: 8 },
          { id: '9-2', name: 'UHT Milk', categoryId: '9', productCount: 4 },
          { id: '9-3', name: 'Powdered', categoryId: '9', productCount: 4 },
        ]
      },
      {
        id: '10',
        name: 'Plant based milk',
        image: 'https://via.placeholder.com/120x120/F3E5F5/333333?text=PlantMilk',
        subCategories: [
          { id: '10-1', name: 'All', categoryId: '10', productCount: 15 },
          { id: '10-2', name: 'Almond', categoryId: '10', productCount: 5 },
          { id: '10-3', name: 'Oat', categoryId: '10', productCount: 5 },
          { id: '10-4', name: 'Soy', categoryId: '10', productCount: 5 },
        ]
      },
      {
        id: '11',
        name: 'Egg',
        image: 'https://via.placeholder.com/120x120/FFF8E1/333333?text=Eggs',
        subCategories: [
          { id: '11-1', name: 'All', categoryId: '11', productCount: 10 },
          { id: '11-2', name: 'Large', categoryId: '11', productCount: 4 },
          { id: '11-3', name: 'Medium', categoryId: '11', productCount: 3 },
          { id: '11-4', name: 'Organic', categoryId: '11', productCount: 3 },
        ]
      },
    ]
  },
  {
    id: 'group4',
    title: 'Dairy',
    categories: [
      {
        id: '12',
        name: 'Youghart',
        image: 'https://via.placeholder.com/120x120/FCE4EC/333333?text=Yogurt',
        subCategories: [
          { id: '12-1', name: 'All', categoryId: '12', productCount: 20 },
          { id: '12-2', name: 'Greek', categoryId: '12', productCount: 8 },
          { id: '12-3', name: 'Regular', categoryId: '12', productCount: 8 },
          { id: '12-4', name: 'Flavored', categoryId: '12', productCount: 4 },
        ]
      },
      {
        id: '13',
        name: 'Butter',
        image: 'https://via.placeholder.com/120x120/FFFDE7/333333?text=Butter',
        subCategories: [
          { id: '13-1', name: 'All', categoryId: '13', productCount: 8 },
          { id: '13-2', name: 'Salted', categoryId: '13', productCount: 4 },
          { id: '13-3', name: 'Unsalted', categoryId: '13', productCount: 4 },
        ]
      },
      {
        id: '14',
        name: 'Fresh Cream',
        image: 'https://via.placeholder.com/120x120/F1F8E9/333333?text=Cream',
        subCategories: [
          { id: '14-1', name: 'All', categoryId: '14', productCount: 6 },
          { id: '14-2', name: 'Heavy', categoryId: '14', productCount: 3 },
          { id: '14-3', name: 'Light', categoryId: '14', productCount: 3 },
        ]
      },
      {
        id: '15',
        name: 'White Cheese',
        image: 'https://via.placeholder.com/120x120/E0F2F1/333333?text=Cheese',
        subCategories: [
          { id: '15-1', name: 'All', categoryId: '15', productCount: 12 },
          { id: '15-2', name: 'Feta', categoryId: '15', productCount: 4 },
          { id: '15-3', name: 'Mozzarella', categoryId: '15', productCount: 4 },
          { id: '15-4', name: 'Cottage', categoryId: '15', productCount: 4 },
        ]
      },
    ]
  },
];

// Keep the old structure for backward compatibility
export const sampleCategories: Category[] = categoryGroups.flatMap(group => group.categories);

export const sampleProducts: Product[] = [
  // Vegetables - Showcasing all variations
  {
    id: 'p1',
    name: 'Tasali Chips Chilly & Lemon',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: ['Express Get it today', 'Lowest price in 7 days'],
    badge: undefined,
    soldCount: undefined,
  },
  {
    id: 'p2',
    name: 'Almarai Fresh Milk',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.2,
    reviews: 89,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: ['Lowest price in 7 days'],
    badge: 'best-seller',
    soldCount: undefined,
  },
  {
    id: 'p3',
    name: 'Tasali Chips Original',
    price: 180.50,
    originalPrice: 1900,
    discount: 16,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: [],
    badge: undefined,
    soldCount: undefined,
  },
  {
    id: 'p3b',
    name: 'Danone Yogurt Pack',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.3,
    reviews: 67,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: ['Lowest price in 7 days'],
    badge: 'best-seller',
    soldCount: undefined,
  },
  {
    id: 'p3c',
    name: 'White Cheese Feta',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.6,
    reviews: 92,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: [],
    badge: 'combo',
    soldCount: undefined,
  },
  {
    id: 'p3d',
    name: 'Fresh Tomato Pack',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.8,
    reviews: 145,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: ['schedule Get it tomorrow'],
    badge: undefined,
    soldCount: undefined,
  },
  {
    id: 'p3e',
    name: 'Premium Dates Box',
    price: 180.50,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.4,
    reviews: 78,
    inStock: false,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: [],
    badge: 'best-seller',
    soldCount: 30,
  },
  {
    id: 'p3f',
    name: 'Heinz Tomato Sauce',
    price: 180.50,
    originalPrice: 1900,
    discount: 32,
    image: getRandomProductImage(),
    categoryId: '1',
    subCategoryId: '1-1',
    rating: 4.9,
    reviews: 201,
    inStock: true,
    uom: 'KG',
    uomValue: 1,
    promotionalMessages: [],
    badge: 'combo',
    soldCount: undefined,
  },
  // Daily Products - Fruits
  {
    id: 'p4',
    name: 'Red Apples 1kg',
    price: 18.50,
    originalPrice: 22.00,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/FF9800/FFFFFF?text=Apples',
    categoryId: '2',
    subCategoryId: '2-2',
    rating: 4.3,
    reviews: 67,
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Bananas Bunch',
    price: 7.25,
    image: 'https://via.placeholder.com/150x150/FF9800/FFFFFF?text=Bananas',
    categoryId: '2',
    subCategoryId: '2-4',
    rating: 4.4,
    reviews: 92,
    inStock: true,
  },
  // Frozen Products
  {
    id: 'p6',
    name: 'Mixed Frozen Vegetables',
    price: 25.75,
    originalPrice: 30.50,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/2196F3/FFFFFF?text=FrozenVeg',
    categoryId: '4',
    subCategoryId: '4-2',
    rating: 4.8,
    reviews: 234,
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Frozen Strawberries',
    price: 18.25,
    image: 'https://via.placeholder.com/150x150/E91E63/FFFFFF?text=FrozenBerries',
    categoryId: '5',
    subCategoryId: '5-2',
    rating: 4.9,
    reviews: 189,
    inStock: true,
  },
  {
    id: 'p8',
    name: 'French Fries Regular',
    price: 12.50,
    originalPrice: 15.00,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/FF5722/FFFFFF?text=Fries',
    categoryId: '6',
    subCategoryId: '6-2',
    rating: 4.2,
    reviews: 145,
    inStock: true,
  },
  // Milk & Egg
  {
    id: 'p9',
    name: 'Fresh Whole Milk 1L',
    price: 8.50,
    originalPrice: 10.25,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/FFF3E0/333333?text=Milk',
    categoryId: '8',
    subCategoryId: '8-2',
    rating: 4.1,
    reviews: 78,
    inStock: true,
  },
  {
    id: 'p10',
    name: 'Farm Fresh Eggs (12)',
    price: 15.75,
    image: 'https://via.placeholder.com/150x150/FFF8E1/333333?text=Eggs',
    categoryId: '11',
    subCategoryId: '11-2',
    rating: 4.6,
    reviews: 112,
    inStock: true,
  },
  {
    id: 'p11',
    name: 'Almond Milk 1L',
    price: 22.50,
    originalPrice: 27.00,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/F3E5F5/333333?text=AlmondMilk',
    categoryId: '10',
    subCategoryId: '10-2',
    rating: 4.4,
    reviews: 203,
    inStock: true,
  },
  // Dairy
  {
    id: 'p12',
    name: 'Greek Yogurt 500g',
    price: 12.25,
    image: 'https://via.placeholder.com/150x150/FCE4EC/333333?text=Yogurt',
    categoryId: '12',
    subCategoryId: '12-2',
    rating: 4.7,
    reviews: 45,
    inStock: true,
  },
  {
    id: 'p13',
    name: 'Natural Butter 250g',
    price: 18.50,
    originalPrice: 22.00,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/FFFDE7/333333?text=Butter',
    categoryId: '13',
    subCategoryId: '13-2',
    rating: 4.3,
    reviews: 67,
    inStock: true,
  },
  {
    id: 'p14',
    name: 'Fresh Cream 200ml',
    price: 9.75,
    image: 'https://via.placeholder.com/150x150/F1F8E9/333333?text=Cream',
    categoryId: '14',
    subCategoryId: '14-2',
    rating: 4.5,
    reviews: 89,
    inStock: true,
  },
  {
    id: 'p15',
    name: 'Feta Cheese 200g',
    price: 16.25,
    originalPrice: 19.50,
    discount: 16,
    image: 'https://via.placeholder.com/150x150/E0F2F1/333333?text=Feta',
    categoryId: '15',
    subCategoryId: '15-2',
    rating: 4.6,
    reviews: 134,
    inStock: true,
  },
];

export const sampleUser: User = {
  id: '1',
  name: 'Hanzada Zada',
  email: 'hanzada@example.com',
  avatar: 'https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=HZ',
  phone: '+20 123 456 7890',
  walletBalance: 150.00,
};

export const sampleAddresses: Address[] = [
  {
    id: 'addr1',
    label: 'Home',
    street: '7 El Batrawy Street, Before El Nadi El Ahly',
    city: 'Cairo',
    building: '7',
    floor: '3',
    apartment: '5',
    isDefault: true,
  },
  {
    id: 'addr2',
    label: 'Work',
    street: '123 Tahrir Square',
    city: 'Cairo',
    building: '123',
    floor: '10',
    apartment: '1001',
    isDefault: false,
  },
];

export const samplePaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'visa',
    lastFourDigits: '1344',
    isDefault: true,
  },
  {
    id: 'pm2',
    type: 'cash',
    isDefault: false,
  },
  {
    id: 'pm3',
    type: 'apple-pay',
    isDefault: false,
  },
];

export const sampleCartItems: CartItem[] = [
  {
    id: 'cart1',
    productId: 'p1',
    quantity: 2,
    product: sampleProducts[0],
    shipmentType: 'express',
    selectedOptions: '1KG',
  },
  {
    id: 'cart2',
    productId: 'p2',
    quantity: 1,
    product: sampleProducts[1],
    shipmentType: 'express',
  },
  {
    id: 'cart3',
    productId: 'p3',
    quantity: 3,
    product: sampleProducts[2],
    shipmentType: 'express',
  },
  {
    id: 'cart4',
    productId: 'p3e',
    quantity: 1,
    product: sampleProducts[6], // Out of stock item
    shipmentType: 'express',
  },
  {
    id: 'cart5',
    productId: 'p4',
    quantity: 2,
    product: sampleProducts[8],
    shipmentType: 'scheduled',
    selectedOptions: '1KG',
  },
  {
    id: 'cart6',
    productId: 'p5',
    quantity: 1,
    product: sampleProducts[9],
    shipmentType: 'scheduled',
  },
  {
    id: 'cart7',
    productId: 'p6',
    quantity: 2,
    product: sampleProducts[10],
    shipmentType: 'scheduled',
  },
  {
    id: 'cart8',
    productId: 'p7',
    quantity: 1,
    product: sampleProducts[11],
    shipmentType: 'scheduled',
  },
];
