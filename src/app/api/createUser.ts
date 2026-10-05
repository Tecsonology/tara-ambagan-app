const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create user");
  }

  return result;
};
