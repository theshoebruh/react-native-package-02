// prettier-ignore
import WunderWheel from '@theshoebruh/react-native-wunderwheel';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <WunderWheel
        labels={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']}
        colors={[
          'red',
          'green',
          'blue',
          'yellow',
          'purple',
          'orange',
          'red',
          'green',
          'blue',
          'yellow',
        ]}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
