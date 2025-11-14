import axios from 'axios';
import type { 
  User, 
  Group, 
  Expense, 
  Settlement, 
  CalculatedSettlement,
  AuthResponse 
} from '@/types';

const API_BASE_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post<User>('/auth/signup', { name, email, password });
    return data;
  },
  
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  }
};

// Groups API
export const groupsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Group[]>('/groups/');
    return data;
  },
  
  create: async (name: string, description: string) => {
    const { data } = await apiClient.post<Group>('/groups/', { name, description });
    return data;
  },
  
  addMember: async (groupId: string, member_email: string) => {
    const { data } = await apiClient.post(`/groups/${groupId}/add-member?member_email=${member_email}`);
    return data;
  },
  
  addMembers: async (groupId: string, member_emails: string[]) => {
    const { data } = await apiClient.post(`/groups/${groupId}/add-members`, { member_emails });
    return data;
  },
  
  removeMember: async (groupId: string, member_email: string) => {
    const { data } = await apiClient.post(`/groups/${groupId}/remove-member?member_email=${member_email}`);
    return data;
  }
};

// Expenses API
export const expensesApi = {
  getByGroup: async (groupId: string) => {
    const { data } = await apiClient.get<Expense[]>(`/expenses/group/${groupId}`);
    return data;
  },
  
  getMy: async () => {
    const { data } = await apiClient.get<Expense[]>('/expenses/my');
    return data;
  },
  
  getById: async (expenseId: string) => {
    const { data } = await apiClient.get<Expense>(`/expenses/${expenseId}`);
    return data;
  },
  
  create: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const { data } = await apiClient.post<Expense>('/expenses/', expense);
    return data;
  },
  
  update: async (expenseId: string, expense: Partial<Expense>) => {
    const { data } = await apiClient.put<Expense>(`/expenses/${expenseId}`, expense);
    return data;
  },
  
  delete: async (expenseId: string) => {
    await apiClient.delete(`/expenses/${expenseId}`);
  }
};

// Settlements API
export const settlementsApi = {
  calculate: async (groupId: string) => {
    const { data } = await apiClient.post<CalculatedSettlement[]>(`/settlements/calculate/${groupId}`);
    return data;
  },
  
  settle: async (groupId: string, settlements: CalculatedSettlement[]) => {
    const { data } = await apiClient.post<Settlement[]>(`/settlements/settle/${groupId}`, { settlements });
    return data;
  },
  
  getByGroup: async (groupId: string) => {
    const { data } = await apiClient.get<Settlement[]>(`/settlements/${groupId}`);
    return data;
  }
};
