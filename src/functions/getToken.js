import AsyncStorage from "@react-native-async-storage/async-storage";
const getToken = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      console.log("Data retrieved successfully: ", value);
      return value;
    } else {
      console.log("No data found");
    }
  } catch (error) {
    console.log("Error retrieving data: ", error);
  }
};
export default getToken;
