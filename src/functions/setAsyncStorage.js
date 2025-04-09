import AsyncStorage from "@react-native-async-storage/async-storage";
const setAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log("Data stored successfully");
  } catch (error) {
    console.log("Error storing data: ", error);
  }
};

export default setAsyncStorage;
