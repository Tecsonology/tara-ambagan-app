const API_URL = "http://YOUR_PC_IP:5000/api/users";

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
};
