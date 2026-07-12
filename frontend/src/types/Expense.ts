export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Expense {
  _id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description?: string;
}

export interface ExpenseResponse {
  message: string;
  data: Expense[];
}

export interface Category {
  _id: string;
  name: string;
  user_id: string;
}

export interface CategoryResponse {
  message: string;
  data: Category[];
}

export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Register {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}