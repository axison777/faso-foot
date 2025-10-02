// src/app/models/role.model.ts
export interface Role {
  slug?: string;          // généré côté backend
  name: string;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  message: string;
}
