const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getAmbagan = async () => {
  const response = await fetch(`${API_URL}/ambagan/`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch ambagan");
  }

  console.log(data);
  return data;
};
