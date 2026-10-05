const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const joinContribution = async (ambaganId: string, userId: string) => {
  try {
    const response = await fetch(
      `${API_URL}/users/${ambaganId}/join/me/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed");
    }

    return response;
  } catch (error) {
    console.error(error);
  }
};
