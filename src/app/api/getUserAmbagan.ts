const USER_KEY = process.env.EXPO_PUBLIC_API_URL;

export interface Ambagan {
  _id: string;
  ambaganName: string;
  currentAmount: number;
  contributionType: "Fixed" | "Open";
  targetAmount: number | null;
  membersCount: number;
  visibility: "Public" | "Private";
  user: string;
  dueDate?: string;
  contributors?: Contributor[];
}

export interface Contributor {
  _id: string;
  user: string;
  contributorName?: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JoinedContribution {
  ambaganId: Ambagan;
}

export const getUserAmbagan = async (userId: string) => {
  try {
    const response = await fetch(`${USER_KEY}/users/${userId}/joined_ambagan`);

    if (!response) {
      throw new Error("Failed to fetch user's ambagan lists");
    }

    const data: JoinedContribution[] = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
};
