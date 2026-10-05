const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  token: string;
}

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
};
