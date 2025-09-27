import { Vibration } from "react-native";
import * as Haptics from 'expo-haptics';

const triggerVibration = () => {
  //Vibration.vibrate(1000);
};

export async function triggerSelectionHaptic() {
  try {
    await Haptics.selectionAsync();
  } catch (e) {
    console.warn('Haptics not available', e);
  }
}

export default triggerVibration;
