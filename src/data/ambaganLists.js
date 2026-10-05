import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeUser = async (userObject) => {
  try {
    const existingData = await AsyncStorage.getItem("user-item");

    const lists = existingData ? JSON.parse(existingData) : null;

    lists.push(userObject);

    await AsyncStorage.setItem("user-item", JSON.stringify(lists));
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("user-item");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(error);
  }
};

export const getCurrentEventPage = async (id) => {
  try {
    const jsonValue = await AsyncStorage.getItem("user-item");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(error);
  }
};
