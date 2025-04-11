import AsyncStorage from "@react-native-async-storage/async-storage";
const getAsyncStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    } else {
    }
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};
export default getAsyncStorage;
