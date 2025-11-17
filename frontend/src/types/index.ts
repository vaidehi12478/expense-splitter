export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GroupMember {
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number;
  description?: string;
  category: string;
  paidBy: string;
  splitType: 'equal' | 'unequal' | 'percentage';
  splits: Record<string, number> | null;
  date: string;
  createdAt: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  paidBy: string;
  paidTo: string;
  amount: number;
  date: string;
}

export interface CalculatedSettlement {
  paidBy: string;
  paidTo: string;
  amount: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
