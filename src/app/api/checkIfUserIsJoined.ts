const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CheckJoinedResponse {
  joined: boolean;
  ambaganId: string;
  userId: string;
}

export const checkJoinedAmbagan = async (
  ambaganId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/ambagan/${ambaganId}/joined/${userId}`,
    );

    const data: CheckJoinedResponse = await response.json();

    if (!response.ok) {
      throw new Error("Failed to check joined status");
    }

    return data.joined;
  } catch (error) {
    console.error("Check joined Ambagan error:", error);

    throw error;
  }
};
