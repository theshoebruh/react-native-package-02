import WunderWheel from '@theshoebruh/react-native-wunderwheel';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WunderWheel />
    </GestureHandlerRootView>
  );
}
