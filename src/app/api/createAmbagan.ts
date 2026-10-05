const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CreateAmbaganData {
  user: string;
  ambaganName: string;
  contributionType: "Fixed" | "Open";
  targetAmount?: number;
  visibility: "Public" | "Private";
  dueDate?: string;
}

export const createAmbagan = async (data: CreateAmbaganData) => {
  const response = await fetch(`${API_URL}/ambagan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ambaganName: data.ambaganName,
      contributionType: data.contributionType,
      targetAmount: data.targetAmount,
      visibility: data.visibility,
      dueDate: data.dueDate,
      user: data.user,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create Ambagan");
  }

  return result;
};
