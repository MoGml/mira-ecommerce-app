import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_KEY = '@mira_language';
export const ONBOARDING_SEEN_KEY = '@mira_onboarding_seen';
export const AUTH_STATUS_KEY = '@mira_auth_status';
export const DEVICE_ID_KEY = '@mira_device_id';
export const AUTH_TOKEN_KEY = '@mira_auth_token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type HeadersInit = Record<string, string>;

const STAGING_BASE_URL = 'https://mira-stag.runasp.net/customer/api/';
const PRODUCTION_BASE_URL = 'https://a2b.runasp.net/customer/api/';

export function getBaseUrl() {
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim().length > 0) {
    return envBase.endsWith('/') ? envBase : `${envBase}/`;
  }
  return __DEV__ ? STAGING_BASE_URL : PRODUCTION_BASE_URL;
}

function generateRandomId() {
  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${random}`;
}

export async function getOrCreateDeviceId() {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = generateRandomId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

async function buildHeaders(extra?: HeadersInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const language = (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
  headers['Accept-Language'] = language;

  const deviceId = await getOrCreateDeviceId();
  headers['X-Device-Id'] = deviceId;

  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 [API] Using auth token:', token.substring(0, 30) + '...' + token.substring(token.length - 10));
  } else {
    console.log('⚠️ [API] No auth token found in AsyncStorage');
  }

  return { ...(extra as any), ...headers } as HeadersInit;
}

export async function getDefaultHeaders() {
  const h = await buildHeaders();
  // Ensure a serializable plain object for logging
  return Object.assign({}, h as any) as Record<string, string>;
}

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

// Generate cache key for request deduplication
function generateCacheKey(path: string, options?: { method?: HttpMethod; body?: any; headers?: HeadersInit }): string {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.stringify(options.body) : '';
  return `${method}:${path}:${body}`;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is retryable
function isRetryableError(error: any): boolean {
  // Retry on network errors, 5xx server errors, and 429 (rate limit)
  return !error.status || 
         error.status >= 500 || 
         error.status === 429 ||
         error.message?.includes('Network') ||
         error.message?.includes('timeout');
}

export async function apiFetch(path: string, options?: { method?: HttpMethod; body?: any; headers?: HeadersInit; retries?: number }) {
  const url = `${getBaseUrl()}${path.replace(/^\//, '')}`;
  const method = options?.method || 'GET';
  const headers = await buildHeaders(options?.headers);
  const retries = options?.retries ?? MAX_RETRIES;
  
  const init: RequestInit = {
    method,
    headers,
  };
  
  if (options?.body !== undefined) {
    init.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  // Dynamic endpoints that should never be cached (user-specific, frequently changing data)
  const noCacheEndpoints = ['Bags', 'Catalog', 'Orders'];
  const shouldCache = method === 'GET' && !noCacheEndpoints.some(endpoint => path.includes(endpoint));

  // Generate cache key for GET requests only (POST/PUT/DELETE should not be cached)
  const cacheKey = shouldCache ? generateCacheKey(path, options) : null;

  // Check if we have a pending request for GET requests
  if (cacheKey && requestCache.has(cacheKey)) {
    console.log('🔄 [API_CACHE] Using cached request for:', cacheKey);
    return requestCache.get(cacheKey);
  }

  if (!shouldCache && method === 'GET') {
    console.log('⚡ [API_CACHE] Skipping cache for dynamic endpoint:', path);
  }

  // Log request details
  const requestLog = {
    timestamp: new Date().toISOString(),
    method,
    url,
    headers: Object.assign({}, headers as any),
    body: options?.body,
    path,
    retriesLeft: retries
  };
  
  console.log('🌐 [API_REQUEST]', JSON.stringify(requestLog, null, 2));

  const requestPromise = (async () => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, init);
        const text = await res.text();
        let json: any = undefined;
        
        try {
          json = text ? JSON.parse(text) : undefined;
        } catch (parseError) {
          // Silently handle parse errors - some endpoints return plain text
          // Only log for non-GetArea endpoints to avoid spam
          if (!path.includes('GetArea')) {
            console.warn('⚠️ [API_RESPONSE] Failed to parse JSON response:', parseError);
          }
        }

        // Check if this is a GetArea endpoint for special handling
        const isGetArea = path.includes('GetArea');

        // Log response details (suppress logs for GetArea errors)
        const responseLog = {
          timestamp: new Date().toISOString(),
          method,
          url,
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          body: json || text,
          success: res.ok,
          attempt: attempt + 1,
          totalAttempts: retries + 1
        };

        if (res.ok) {
          console.log('✅ [API_RESPONSE]', JSON.stringify(responseLog, null, 2));
          return json;
        } else {
          // Don't log errors for GetArea (expected when area not covered)
          if (!isGetArea) {
            console.error('❌ [API_RESPONSE]', JSON.stringify(responseLog, null, 2));
          }
          
          const message = (json && (json.message || json.error)) || `HTTP ${res.status}`;
          const error: any = new Error(message);
          error.status = res.status;
          error.body = json || text;
          error.url = url;
          error.method = method;
          error.requestHeaders = headers;
          error.requestBody = options?.body;
          error.attempt = attempt + 1;
          
          lastError = error;
          
          // If this is the last attempt or error is not retryable, throw immediately
          if (attempt === retries || !isRetryableError(error)) {
            throw error;
          }
          
          // Calculate delay with exponential backoff
          const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
          console.log(`🔄 [API_RETRY] Retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
          await sleep(delay);
        }
      } catch (error: any) {
        lastError = error;
        
        // If this is the last attempt or error is not retryable, throw immediately
        if (attempt === retries || !isRetryableError(error)) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
        console.log(`🔄 [API_RETRY] Retrying in ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
        await sleep(delay);
      }
    }
    
    // This should never be reached, but just in case
    throw lastError;
  })();

  // Cache the promise for GET requests
  if (cacheKey) {
    requestCache.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

export type CreateGuestAddressRequest = {
  fcmToken?: string;
  description: string;
  addressTag: string;
  Latitude: number;
  Longitude: number;
};

export type CreateGuestAddressResponse = {
  addressId: number;
  tag: string;
  description: string;
};

export type GuestAddress = {
  id: number;
  addressTag: string;
  street: string | null;
  building: string | null;
  floor: string | null;
  appartmentNumber: string | null;
  landmark: string | null;
  latitude: number;
  longitude: number;
  newContact: boolean;
  contactPerson: string | null;
  contactPersonNumber: string | null;
  description: string;
  isDefault: boolean;
};

export async function getGuestAddress(): Promise<GuestAddress | null> {
  try {
    const response = await apiFetch('Addresses/GetGuestAddress', {
      method: 'GET',
    });
    return response as GuestAddress;
  } catch (e: any) {
    // If no guest address found, return null
    if (e.status === 404 || e.status === 400) {
      return null;
    }
    throw e;
  }
}

export async function createGuestAddress(payload: CreateGuestAddressRequest) {
  try {
    return await apiFetch('Addresses/GuestAddress', {
      method: 'POST',
      body: payload,
    });
  } catch (e: any) {
    // Check if response indicates location is out of service
    if (e && e.body && typeof e.body === 'object') {
      const message = e.body.message || e.body.error || '';
      if (message.toLowerCase().includes('out of service') || message.toLowerCase().includes('not covered')) {
        const error: any = new Error('Location is out of service');
        error.isOutOfService = true;
        error.status = e.status;
        error.body = e.body;
        throw error;
      }
    }
    throw e;
  }
}

export type AreaCoverage = {
  id: number;
  nameEn: string;
  nameAr: string;
};

export type SubCategory = {
  id: number;
  name: string;
  pictureUrl: string | null;
};

export type Category = {
  id: number;
  name: string;
  pictureUrl: string | null;
  subCategories: SubCategory[];
};

export type Pack = {
  packagingId: number;
  name: string;
  pictureUrl: string;
  uomName: string;
  price: number;
  priceAfterDiscount: number;
  discountPercentage: number;
  stockQty: number;
  basketStep: number;
  convertRatio: number;
  outletId: number;
  bagQuantity?: number;
};

export type Product = {
  productId: number;
  subCategoryId: number;
  title: string;
  packs: Pack[];
};

export type CatalogResponse = {
  subCategories: SubCategory[];
  products: Product[];
  page: number;
  pageSize: number;
  totalProducts: number;
};

export async function getCategories(): Promise<Category[]> {
  // console.log('🌐 [CATEGORIES_API] Making request:', {
  //   endpoint: 'Categories',
  //   timestamp: new Date().toISOString()
  // });
  
  const response = await apiFetch('Categories', { method: 'GET' });
  
  // console.log('🌐 [CATEGORIES_API] Response received:', {
  //   endpoint: 'Categories',
  //   categoriesCount: response?.categories?.length || 0,
  //   timestamp: new Date().toISOString()
  // });
  
  // Extract categories from response if it's wrapped in an object
  return response.categories || response || [];
}

export async function getCatalog(categoryId: number, page: number = 1, pageSize: number = 20, subCategoryId?: number): Promise<CatalogResponse> {
  let query = `Catalog/${categoryId}/browse?page=${page}&pageSize=${pageSize}`;
  
  // Add subcategory filter if provided
  if (subCategoryId) {
    query += `&subCategoryId=${subCategoryId}`;
  }
  
  const response = await apiFetch(query, { method: 'GET' });
  
  return response;
}

export async function getAreaCoverage(latitude: number, longitude: number): Promise<AreaCoverage | null> {
  try {
    const query = `Addresses/GetArea?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`;
    const res = await apiFetch(query, { method: 'GET' });

    // Check if response indicates no available area
    if (res && typeof res === 'string' && res.toLowerCase().includes('no available area')) {
      return null; // Not covered
    }

    // If we got a valid area object with id, nameEn, nameAr
    if (res && typeof res === 'object' && res.id) {
      return res as AreaCoverage;
    }

    // Otherwise, area not covered
    return null;
  } catch (e: any) {
    // Silently return null for any error - area not covered
    // Don't show error messages to user
    console.log('[API] Area coverage check - area not covered');
    return null;
  }
}

export type BagItem = {
  packId: number;
  packName: string;
  pictureUrl: string;
  price: number;
  priceAfterDiscount: number;
  discountPercentage: number;
  unitOfMeasureValue: number;
  unitOfMeasureName: string;
  bagQty: number;
  bagItemComment?: string;
  itemOutOfStock: boolean;
  maxQty: number;
};

export type BagResponse = {
  customerId: number;
  addressId: number;
  bagId: number;
  expressBagItems: BagItem[];
  tomorrowBagItems: BagItem[];
  expressBagSubTotal: number;
  tomorrowsBagSubTotal: number;
  bagSubTotal: number;
};

export async function getBag(): Promise<BagResponse> {
  try {
    console.log('🛒 [GET_BAG] Making API call to Bags endpoint');
    const result = await apiFetch('Bags', {
      method: 'GET',
    });
    console.log('🛒 [GET_BAG] API call successful:', result);

    // Check if the response is the "Bag is empty" message instead of actual bag data
    if (result && typeof result === 'object' && 'message' in result && result.message === 'Bag is empty') {
      console.log('🛒 [GET_BAG] Bag is empty - returning empty bag structure');
      return {
        customerId: 0,
        addressId: 0,
        bagId: 0,
        expressBagItems: [],
        tomorrowBagItems: [],
        expressBagSubTotal: 0,
        tomorrowsBagSubTotal: 0,
        bagSubTotal: 0,
      };
    }

    return result;
  } catch (e: any) {
    // Handle "Bag is empty" errors
    if (e.message === 'Bag is empty' || e.body?.message === 'Bag is empty') {
      console.log('🛒 [GET_BAG] Bag is empty (from error) - returning empty bag structure');
      return {
        customerId: 0,
        addressId: 0,
        bagId: 0,
        expressBagItems: [],
        tomorrowBagItems: [],
        expressBagSubTotal: 0,
        tomorrowsBagSubTotal: 0,
        bagSubTotal: 0,
      };
    }

    console.error('🛒 [GET_BAG] API call failed:', {
      message: e.message,
      status: e.status,
      body: e.body,
      url: e.url
    });
    // Re-throw with additional context for real errors
    const error: any = new Error(e.message || 'Failed to fetch bag');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

export type MutateBagRequest = {
  packgingId: number;
  quantity: number;
  comment?: string;
};

export type MutateBagResponse = {
  success: boolean;
  message?: string;
};

export async function mutateBag(payload: MutateBagRequest): Promise<MutateBagResponse> {
  try {
    const response = await apiFetch('Bags/MutateBag', {
      method: 'POST',
      body: payload,
    });

    // No cache clearing needed - Bags endpoint is never cached
    return response;
  } catch (e: any) {
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to update bag');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

// Checkout types
export type CheckoutItem = {
  packagingId: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
  pricePerUnitAfterDiscount: number;
  lineTotal: number;
};

export type CheckoutShipment = {
  outletId: number;
  outletName: string;
  shipmentId: number;
  shipmentName: string;
  deliveryFromUtc: string | null;
  deliveryToUtc: string | null;
  deliveryCost: number;
  subtotal: number;
  total: number;
  items: CheckoutItem[];
};

export type CheckoutDetailsValue = {
  bagId: number;
  areaId: number;
  priceChanged: boolean;
  shipments: CheckoutShipment[];
  subtotal: number;
  delivery: number;
  total: number;
};

export type CheckoutDetailsResponse = {
  value: CheckoutDetailsValue;
  formatters: any[];
  contentTypes: any[];
  declaredType: string | null;
  statusCode: number;
};

export async function getCheckoutDetails(): Promise<CheckoutDetailsResponse> {
  try {
    return await apiFetch('Checkout', {
      method: 'GET',
    });
  } catch (e: any) {
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to fetch checkout details');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

// Auth/Login types
export type Address = {
  id: number;
  addressTag: string;
  appartmentNumber: number | null;
  floor: number | null;
  building: string | null;
  street: string | null;
  landmark: string | null;
  latitude: number;
  longitude: number;
  newContact: boolean;
  contactPerson: string | null;
  contactPersonNumber: string | null;
  description: string;
  isDefault?: boolean;
};

export type LoginRequest = {
  fcmToken: string;
  idToken: string;
  phoneNumber: string;
  countryCode: number;
};

export type LoginResponse = {
  customerId: number;
  wallet: number;
  points: number;
  phoneNumber: string;
  displayName: string;
  token: string;
  selectedAddress: Address | null;
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  try {
    return await apiFetch('Accounts/Login', {
      method: 'POST',
      body: payload,
    });
  } catch (e: any) {
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to login');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

// Create Address for logged-in users
export type CreateAddressRequest = {
  addressTag: string;
  appartmentNumber?: number;
  floor?: number;
  building?: string;
  street?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  newContact?: boolean;
  contactPerson?: string;
  contactPersonNumber?: string;
  description: string;
};

export type CreateAddressResponse = {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: Address[];
};

export async function createAddress(payload: CreateAddressRequest): Promise<CreateAddressResponse> {
  try {
    return await apiFetch('Addresses', {
      method: 'POST',
      body: payload,
    });
  } catch (e: any) {
    // Check if response indicates location is out of service
    if (e && e.body && typeof e.body === 'object') {
      const message = e.body.message || e.body.error || '';
      if (message.toLowerCase().includes('out of service') || message.toLowerCase().includes('not covered')) {
        const error: any = new Error('Location is out of service');
        error.isOutOfService = true;
        error.status = e.status;
        error.body = e.body;
        throw error;
      }
    }
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to create address');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

// Place Order types
export type PlaceOrderRequest = {
  contactPerson: string;
  contactPersonPhoneNumber: string;
  deliveryTips: number;
  promoCode: string;
};

export type PlaceOrderResponse = {
  orderId: string;
  status: string;
  message: string;
};

export async function placeOrder(payload: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  try {
    return await apiFetch('PlaceOrders/place', {
      method: 'POST',
      body: payload,
    });
  } catch (e: any) {
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to place order');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}

// Bring To My Area types
export type BringToMyAreaRequest = {
  latittude: string;  // Note: API expects "latittude" with double 't'
  description: string;
  longitude: string;
};

export type BringToMyAreaResponse = {
  success: boolean;
  message?: string;
};

export async function bringToMyArea(payload: BringToMyAreaRequest): Promise<BringToMyAreaResponse> {
  try {
    const response = await apiFetch('Addresses/BringToMyArea', {
      method: 'POST',
      body: payload,
    });
    return response || { success: true };
  } catch (e: any) {
    // Re-throw with additional context
    const error: any = new Error(e.message || 'Failed to submit bring to my area request');
    error.status = e.status;
    error.body = e.body;
    throw error;
  }
}



