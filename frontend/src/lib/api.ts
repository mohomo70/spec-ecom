const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // Products
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}/`);
  }

  // Categories
  async getCategories() {
    return this.request('/categories/');
  }

  // Cart
  async getCart() {
    return this.request('/cart/');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/cart/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  // Auth
  async register(data: { username: string; email: string; password: string; password_confirm: string; first_name?: string; last_name?: string }) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/auth/me/');
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.request('/auth/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Orders
  async getOrders() {
    return this.request('/orders/');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}/`);
  }

  async createOrder(data: Record<string, unknown>) {
    return this.request('/orders/checkout/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Addresses
  async getAddresses() {
    return this.request('/addresses/');
  }

  async createAddress(data: Record<string, unknown>) {
    return this.request('/addresses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: Record<string, unknown>) {
    return this.request(`/addresses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request(`/addresses/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);