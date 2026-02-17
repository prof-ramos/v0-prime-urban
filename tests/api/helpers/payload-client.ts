/**
 * Payload CMS API Client for TypeScript/Node.js tests
 *
 * Provides a typed client for interacting with Payload CMS API
 * in test scenarios (e.g., Vitest, Jest).
 */

interface PayloadConfig {
  baseURL: string;
  apiPath?: string;
  timeout?: number;
}

interface AuthConfig {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface APIResponse<T = any> {
  data?: T;
  docs?: T[];
  totalDocs?: number;
  errors?: Array<{ message: string; field?: string }>;
}

interface WhereClause {
  and?: Array<Record<string, any>>;
  or?: Array<Record<string, any>>;
}

// =============================================================================
// EXCEPTION CLASSES
// =============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class ValidationError extends APIError {
  constructor(message: string, response?: any) {
    super(message, 400, response);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, response?: any) {
    super(message, 401, response);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string, response?: any) {
    super(message, 403, response);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, response?: any) {
    super(message, 404, response);
    this.name = "NotFoundError";
  }
}

// =============================================================================
// BASE API CLIENT
// =============================================================================

export class BasePayloadClient {
  protected baseURL: string;
  protected apiPath: string;
  protected timeout: number;
  protected headers: Record<string, string>;

  constructor(config: PayloadConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, "");
    this.apiPath = config.apiPath || "/api";
    this.timeout = config.timeout || 30000;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  protected get apiUrl(): string {
    return `${this.baseURL}${this.apiPath}`;
  }

  protected async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        this.throwError(response.status, data);
      }

      return data as APIResponse<T>;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new APIError(`Request timeout after ${this.timeout}ms`);
      }

      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(`Request failed: ${error.message}`);
    }
  }

  protected throwError(statusCode: number, data: any): never {
    const message = data.errors?.[0]?.message || data.message || "Unknown error";

    const errorMap: Record<number, typeof APIError> = {
      400: ValidationError,
      401: AuthenticationError,
      403: AuthorizationError,
      404: NotFoundError,
    };

    const ErrorClass = errorMap[statusCode] || APIError;
    throw new ErrorClass(message, statusCode, data);
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<APIResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;

    return this.request<T>(url, { method: "GET" });
  }

  async post<T = any>(
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// =============================================================================
// AUTHENTICATED CLIENT
// =============================================================================

export class PayloadClient extends BasePayloadClient {
  private token?: string;

  constructor(config: PayloadConfig & { token?: string }) {
    super(config);
    if (config.token) {
      this.token = config.token;
      this.headers.Authorization = `Bearer ${config.token}`;
    }
  }

  static async login(
    config: PayloadConfig & { auth: AuthConfig }
  ): Promise<PayloadClient> {
    const client = new PayloadClient(config);
    const response = await client.loginInternal(config.auth);
    return new PayloadClient({
      ...config,
      token: response.token,
    });
  }

  private async loginInternal(auth: AuthConfig): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/users/login", auth);
    if (!response.token) {
      throw new AuthenticationError("Login response missing token");
    }
    this.token = response.token;
    this.headers.Authorization = `Bearer ${this.token}`;
    return response as LoginResponse;
  }

  // -------------------------------------------------------------------------
  // COLLECTION METHODS
  // -------------------------------------------------------------------------

  async create<T = any>(
    collection: string,
    data: any
  ): Promise<APIResponse<T>> {
    return this.post<T>(`/${collection}`, data);
  }

  async find<T = any>(
    collection: string,
    options: {
      where?: WhereClause;
      sort?: string;
      limit?: number;
      page?: number;
      depth?: number;
    } = {}
  ): Promise<APIResponse<T>> {
    const params: Record<string, string> = {};

    if (options.where) {
      params.where = JSON.stringify(options.where);
    }
    if (options.sort) {
      params.sort = options.sort;
    }
    if (options.limit) {
      params.limit = String(options.limit);
    }
    if (options.page) {
      params.page = String(options.page);
    }
    if (options.depth) {
      params.depth = String(options.depth);
    }

    return this.get<T>(`/${collection}`, params);
  }

  async findById<T = any>(
    collection: string,
    id: string,
    depth?: number
  ): Promise<APIResponse<T>> {
    const params = depth ? { depth: String(depth) } : undefined;
    return this.get<T>(`/${collection}/${id}`, params);
  }

  async update<T = any>(
    collection: string,
    id: string,
    data: any
  ): Promise<APIResponse<T>> {
    return this.patch<T>(`/${collection}/${id}`, data);
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.deleteRequest(`/${collection}/${id}`);
  }

  private async deleteRequest(endpoint: string): Promise<APIResponse> {
    return this.request(endpoint, { method: "DELETE" });
  }

  // -------------------------------------------------------------------------
  // SPECIFIC COLLECTION HELPERS
  // -------------------------------------------------------------------------

  // Properties
  async createProperty(data: any) {
    return this.create("/properties", data);
  }

  async findProperties(filters?: {
    status?: string;
    type?: string;
    category?: string;
    neighborhood?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }) {
    const where: WhereClause = { and: [] };

    if (filters?.status) {
      where.and!.push({ status: { equals: filters.status } });
    }
    if (filters?.type) {
      where.and!.push({ type: { equals: filters.type } });
    }
    if (filters?.category) {
      where.and!.push({ category: { equals: filters.category } });
    }
    if (filters?.neighborhood) {
      where.and!.push({ neighborhood: { equals: filters.neighborhood } });
    }
    if (filters?.minPrice) {
      where.and!.push({ price: { greater_than_equal: filters.minPrice } });
    }
    if (filters?.maxPrice) {
      where.and!.push({ price: { less_than_equal: filters.maxPrice } });
    }

    const options: any = { limit: filters?.limit || 10 };
    if (where.and!.length > 0) {
      options.where = where;
    }

    return this.find("/properties", options);
  }

  // Leads
  async createLead(data: any) {
    return this.create("/leads", data);
  }

  async findLeads(filters?: {
    status?: string;
    assignedTo?: string;
    limit?: number;
  }) {
    const where: WhereClause = { and: [] };

    if (filters?.status) {
      where.and!.push({ status: { equals: filters.status } });
    }
    if (filters?.assignedTo) {
      where.and!.push({ assignedTo: { equals: filters.assignedTo } });
    }

    const options: any = { limit: filters?.limit || 10, sort: "-createdAt" };
    if (where.and!.length > 0) {
      options.where = where;
    }

    return this.find("/leads", options);
  }

  // Users
  async createUser(data: any) {
    return this.create("/users", data);
  }

  async findUsers(filters?: { role?: string; limit?: number }) {
    const options: any = { limit: filters?.limit || 10 };

    if (filters?.role) {
      options.where = { role: { equals: filters.role } };
    }

    return this.find("/users", options);
  }

  // -------------------------------------------------------------------------
  // AUTH CHECK
  // -------------------------------------------------------------------------

  async me(): Promise<APIResponse> {
    return this.get("/users/me");
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// =============================================================================
// ANONYMOUS CLIENT
// =============================================================================

export class AnonymousPayloadClient extends BasePayloadClient {
  async login(auth: AuthConfig): Promise<PayloadClient> {
    const response = await this.post<LoginResponse>("/users/login", auth);

    if (!response.token) {
      throw new AuthenticationError("Login response missing token");
    }

    return new PayloadClient({
      baseURL: this.baseURL,
      apiPath: this.apiPath,
      timeout: this.timeout,
      token: response.token,
    });
  }

  async createLeadPublic(data: any) {
    return this.post("/leads/create-public", data);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function buildWhereClause(
  filters: Record<string, any>
): WhereClause | {} {
  const conditions: Record<string, any>[] = [];

  for (const [field, value] of Object.entries(filters)) {
    if (typeof value === "object" && value !== null) {
      // Operators
      for (const [op, val] of Object.entries(value)) {
        const opMap: Record<string, string> = {
          eq: "equals",
          ne: "not_equals",
          gt: "greater_than",
          gte: "greater_than_equal",
          lt: "less_than",
          lte: "less_than_equal",
          like: "like",
          in: "in",
          nin: "not_in",
        };

        conditions.push({
          [field]: { [opMap[op] || op]: val },
        });
      }
    } else {
      // Simple equality
      conditions.push({ [field]: { equals: value } });
    }
  }

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { and: conditions };
}

export function normalizePhoneBr(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  // Remove duplicate country code
  let cleaned = digits;
  if (cleaned.startsWith("55") && cleaned.length > 12) {
    cleaned = cleaned.substring(2);
  }

  // Add country code if missing
  if (!cleaned.startsWith("55")) {
    cleaned = "55" + cleaned;
  }

  return "+" + cleaned;
}
