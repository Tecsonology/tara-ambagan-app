const USER_KEY = process.env.EXPO_PUBLIC_API_URL;

export interface Ambagan {
  _id: string;
  ambaganName: string;
  currentAmount: number;
  contributionType: "Fixed" | "Open";
  targetAmount: number | null;
  membersCount: number;
  visibility: "Public" | "Private";

  user: {
    _id: string;
    name: string;
    email: string;
  };

  dueDate?: string;

  contributors?: Contributor[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Contributor {
  _id: string;
  user: string;
  contributorName?: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getUserCreatedAmbagan = async (
  userId: string,
): Promise<Ambagan[]> => {
  try {
    const response = await fetch(`${USER_KEY}/ambagan/created/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch created Ambagans: ${response.status}`);
    }

    const data: Ambagan[] = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching created Ambagans:", error);

    throw error;
  }
};
