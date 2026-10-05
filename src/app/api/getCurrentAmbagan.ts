const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Ambagan {
  _id: string;
  ambaganName: string;
  targetAmount: number;
  contributionType: string;
  currentAmount: number;
  membersCount: number;
  user: string;
  visibility: string;
  contributors: Contributor[];
}

export interface Contributor {
  _id?: string;
  user: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getCurrentAmbagan = async (
  ambaganId: string,
): Promise<Ambagan> => {
  const response = await fetch(`${API_URL}/ambagan/${ambaganId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch Ambagan");
  }

  return data;
};
