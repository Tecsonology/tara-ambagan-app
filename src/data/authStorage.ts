import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "loggedInUser";

export type StoredUser = {
  _id: string;
  name: string;
  email: string;
};

export const storeUser = async (user: StoredUser) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to store user:", error);
  }
};

export const getUser = async (): Promise<StoredUser | null> => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    const parsedUser: StoredUser = JSON.parse(user);

    return parsedUser;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);

    // Verify that it was actually removed
    const remainingUser = await AsyncStorage.getItem(USER_KEY);

    console.log("User after logout:", remainingUser);
  } catch (error) {
    console.error("Failed to remove user:", error);
  }
};

export const getUserId = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    const parsedUser: StoredUser = JSON.parse(user);

    return parsedUser._id;
  } catch (error) {}
};
