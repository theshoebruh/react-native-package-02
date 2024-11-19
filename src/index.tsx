/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-magic-numbers */
import { useState, useRef, useEffect } from 'react';

import * as d3Shape from 'd3-shape';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Text as RNText,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { G, Path, Text } from 'react-native-svg';

const { width } = Dimensions.get('screen');

// Constants for wheel configuration
const numberOfSegments = 16; // Total number of segments in the wheel
const wheelSize = width * 0.8; // Wheel size relative to screen width
const fontSize = 16; // Font size for segment numbers
const oneTurn = 360; // Degrees in a full rotation
const angleBySegment = oneTurn / numberOfSegments; // Degrees per segment
const angleOffset = angleBySegment / 2; // Offset to center segments
const knobFill = '#63B3ED';
const NUMBER_OF_SEGMENTS = numberOfSegments;
const SEGMENT_ANGLE = 360 / NUMBER_OF_SEGMENTS;

// Interface defining the structure of each wheel segment
interface WheelSegment {
  path: string | null; // SVG path for the segment
  color: string | undefined; // Segment color
  value: string | undefined; // Number/text displayed in segment
  centroid: [number, number]; // Center point coordinates of segment
}

// Creates the wheel segments using D3 for SVG path generation
const makeWheel = (): WheelSegment[] => {
  const data = Array.from({ length: numberOfSegments }).fill(1) as number[];
  const arcs = d3Shape.pie()(data);
  const labels = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
  ];
  const colors = [
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
    'white',
  ];

  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.01)
      .outerRadius(width / 2)
      .innerRadius(60);
    return {
      path: instance({
        ...arc,
        innerRadius: 60,
        outerRadius: width / 2,
      }),
      color: colors[index as number],
      value: labels[index as number],
      centroid: instance.centroid({
        ...arc,
        innerRadius: 60,
        outerRadius: width / 2,
      }) as [number, number],
    };
  });
};

/**
 *
 */
export default function WunderWheel() {
  // Refs and State
  const wheelPaths = useRef(makeWheel()).current; // Store wheel segment data
  const angleRef = useRef(new Animated.Value(0)).current; // Track rotation angle
  const [enabled, setEnabled] = useState(true); // Enable/disable wheel spinning
  const [isFinished, setIsFinished] = useState(false); // Track spin completion
  const [winner, setWinner] = useState<string | null>(null); // Store winning number
  const [currentRotation, setCurrentRotation] = useState<number>(0); // Current wheel rotation
  const [winningIndex, setWinningIndex] = useState<number | null>(null); // Index of winning segment

  // Listen for rotation changes and update currentRotation
  useEffect(() => {
    const listener = angleRef.addListener((value) => {
      setCurrentRotation(value.value);
    });
    return () => angleRef.removeListener(listener);
  }, [angleRef]);

  // Calculate winner when spin is finished
  useEffect(() => {
    if (isFinished) {
      // Calculate winning segment based on final rotation
      const degrees = ((currentRotation % 360) + SEGMENT_ANGLE / 2) % 360;
      const winningSegmentIndex =
        (numberOfSegments - Math.floor(degrees / SEGMENT_ANGLE)) %
        numberOfSegments;

      // Update state with winner
      setWinner(wheelPaths[winningSegmentIndex]?.value?.toString() || null);
      setWinningIndex(winningSegmentIndex);
      setEnabled(true);
      setIsFinished(false);
    }
  }, [isFinished, currentRotation, wheelPaths]);

  // Handle pan gesture for spinning the wheel
  const onPan = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      // Reset states for new spin
      setEnabled(false);
      setWinner(null);
      setWinningIndex(null);

      // Animate the wheel spin using decay animation
      angleRef.setValue(0);
      Animated.decay(angleRef, {
        velocity: nativeEvent.velocityY,
        deceleration: 0.97,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsFinished(true);
        }
      });
    }
  };

  // Render the pointer/knob at top of wheel
  const renderKnob = () => {
    const knobSize = 30;

    return (
      <View
        style={{
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
        }}
      >
        <Svg
          width={knobSize}
          height={(knobSize * 100) / 57}
          viewBox="0 0 57 100"
          style={{ transform: [{ translateY: 8 }] }}
        >
          <Path
            d="M28.034,0C12.552,0,0,12.552,0,28.034S28.034,100,28.034,100s28.034-56.483,28.034-71.966S43.517,0,28.034,0z   M28.034,40.477c-6.871,0-12.442-5.572-12.442-12.442c0-6.872,5.571-12.442,12.442-12.442c6.872,0,12.442,5.57,12.442,12.442  C40.477,34.905,34.906,40.477,28.034,40.477z"
            fill={knobFill}
          />
        </Svg>
      </View>
    );
  };

  // Display the winning number
  const renderWinner = () => {
    return <RNText>Winner is: {winner || ''}</RNText>;
  };

  // Render the main wheel component with segments
  const renderSvgWheel = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {renderKnob()}
        <Animated.View
          style={{
            backgroundColor: '#cef187',
            alignItems: 'center',
            borderRadius: 200,
            padding: 12,
            justifyContent: 'center',
            transform: [
              {
                rotate: angleRef.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, '0deg', `${oneTurn}deg`],
                  extrapolate: 'extend',
                }),
              },
            ],
          }}
        >
          <Svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
          >
            <G y={width / 2} x={width / 2}>
              {wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value?.toString() || '';
                const isWinningSegment = i === winningIndex;

                return (
                  <G key={`arc-${i}`}>
                    <Path
                      d={arc.path || ''}
                      fill={isWinningSegment ? '#63B3ED' : arc.color}
                    />
                    <Text
                      x={x}
                      y={y + 5}
                      fill={isWinningSegment ? 'white' : 'black'}
                      fontWeight="bold"
                      textAnchor="middle"
                      fontSize={fontSize}
                      rotation={i * angleBySegment + angleOffset - 90}
                      origin={`${x}, ${y}`}
                    >
                      {number}
                    </Text>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };

  // Main render with gesture handler for spinning
  return (
    <PanGestureHandler onHandlerStateChange={onPan} enabled={enabled}>
      <View style={styles.container}>
        {renderSvgWheel()}
        {renderWinner()}
      </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerText: {
    fontSize: 32,
    position: 'absolute',
    color: 'black',
    bottom: 10,
  },
});
