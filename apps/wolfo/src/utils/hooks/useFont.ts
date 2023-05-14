import { useFonts } from "expo-font";

const useFont = () => {
  const [loaded] = useFonts({
    Montserrat: require("../../../assets/fonts/Montserrat-Regular.ttf"),
    MontserratBold: require("../../../assets/fonts/Montserrat-SemiBold.ttf"),
    Voyage: require("../../../assets/fonts/Voyage.ttf"),
  });
  return loaded;
};

export default useFont;
