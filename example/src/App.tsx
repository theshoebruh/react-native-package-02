import WunderWheel from 'react-native-awesome-library';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WunderWheel />
    </GestureHandlerRootView>
  );
}
