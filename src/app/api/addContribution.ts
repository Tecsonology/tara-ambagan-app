const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Member {
  user: string;
  contributorName?: string;
  amount: number;
}

export const addContribution = async (id: string, data: Member) => {
  try {
    console.log("test:", id, data);
    const response = await fetch(`${API_URL}/ambagan/${id}/contributors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to add contribution");
    }
  } catch (error) {
    console.error(error);
  }
};
