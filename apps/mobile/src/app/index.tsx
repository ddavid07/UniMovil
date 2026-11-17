import { Platform } from "react-native";
import { CampusScreen as MobileScreen } from "../features/campus/CampusScreen";
import { CampusScreen as WebScreen } from "../features/campus/CampusScreen.web";

export default Platform.OS === "web" ? WebScreen : MobileScreen;
