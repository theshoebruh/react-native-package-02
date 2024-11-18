/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-magic-numbers */
import React, { useState, useRef } from 'react';

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

const numberOfSegments = 16;
const wheelSize = width * 0.8;
const fontSize = 16;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const knobFill = '#63B3ED';

interface WheelSegment {
  path: string | null;
  color: string;
  value: number;
  centroid: [number, number];
}

const makeWheel = (): WheelSegment[] => {
  const data = Array.from({ length: numberOfSegments }).fill(1);
  const arcs = d3Shape.pie()(data);
  const labels = [
    '2 Wunder', // 0
    'No luck', // 1
    '10 Wunder', // 2
    '4 Wunder', // 3
    '2 Wunder', // 4
    'No luck today', // 5
    '20 Wunder', // 6
    '2 Wunder', // 7
    '6 Wunder', // 8
    'No luck today', // 9
    '10 Wunder', // 10
    '4 Wunder', // 11
    '2 Wunder', // 12
    'No luck today', // 13
    '10 Wunder', // 14
    '4 Wunder', // 15
  ];
  const colors = [
    'white',
    '#ff8040',
    '#cef187',
    'white',
    'white',
    '#ff8040',
    '#9013fe',
    'white',
    'white',
    '#ff8040',
    '#cef187',
    'white',
    'white',
    '#ff8040',
    '#cef187',
    'white',
  ];

  return arcs.map((arc: any, index: string | number) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.01)
      .outerRadius(width / 2)
      .innerRadius(60);

    return {
      path: instance(arc),
      color: colors[index as number],
      value: labels[index as number],
      centroid: instance.centroid(arc) as [number, number],
    };
  });
};

/**
 *
 */
export default function WunderWheel() {
  const wheelPaths = useRef(makeWheel()).current;
  const angleRef = useRef(new Animated.Value(0)).current;
  const [enabled, setEnabled] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const onPan = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      const { velocityY } = nativeEvent;

      setEnabled(false);
      setWinner(null);

      const minimumSpins = 2;
      const velocitySpins = Math.abs(velocityY) / 500;
      const totalSpins = Math.max(minimumSpins, velocitySpins);
      const direction = velocityY < 0 ? -1 : 1;
      const targetAngle = direction * oneTurn * totalSpins;

      Animated.spring(angleRef, {
        toValue: targetAngle,
        velocity: velocityY,
        tension: 15,
        friction: 8,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          const finalAngle = angleRef.__getValue();

          // Normalize angle to positive value between 0-360
          const normalizedAngle = ((finalAngle % oneTurn) + oneTurn) % oneTurn;

          // Calculate segment index
          const segmentAngle = oneTurn / numberOfSegments;
          const rawIndex = Math.floor(normalizedAngle / segmentAngle);

          // Since the wheel spins clockwise and pointer is at top,
          // we need to invert the index and offset it
          const adjustedIndex =
            (numberOfSegments - rawIndex) % numberOfSegments;

          console.log({
            finalAngle,
            normalizedAngle,
            segmentAngle,
            rawIndex,
            adjustedIndex,
            winnerValue: wheelPaths[adjustedIndex]?.value,
          });
          setEnabled(true);
          setWinner(wheelPaths[adjustedIndex]?.value?.toString() || null);
        }
      });
    }
  };

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

  const renderWinner = () => {
    if (!winner) return null;
    return <RNText>Winner is: {winner}</RNText>;
  };

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
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}>
            <G y={width / 2} x={width / 2}>
              {wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();

                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path || ''} fill={arc.color} />
                    <Text
                      x={x}
                      y={y + 5}
                      fill={
                        wheelPaths[i]?.color === 'white' ||
                        wheelPaths[i]?.color === '#cef187'
                          ? 'black'
                          : 'white'
                      }
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
