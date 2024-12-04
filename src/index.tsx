/* eslint-disable react-native/no-inline-styles */

import React, { useState, useRef, useEffect } from 'react';

import * as d3Shape from 'd3-shape';
import { StyleSheet, View, Dimensions, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { G, Path, ForeignObject } from 'react-native-svg';

const { width } = Dimensions.get('screen');

// Constants for wheel configuration
const wheelSize = width * 0.8; // Wheel size relative to screen width
const oneTurn = 360; // Degrees in a full rotation

// Interface defining the structure of each wheel segment
interface WheelSegment {
  path: string | null; // SVG path for the segment
  color: string | undefined; // Segment color
  value: G; // Number/text displayed in segment
  centroid: [number, number]; // Center point coordinates of segment
}

export type WunderWheelItem = {
  value: React.ReactNode;
  icon?: React.ReactNode; // Make it optional
  segmentColor: string;
  fontColor?: string;
  fontWeight?: string;
  fontSize?: number;
  winningFontColor?: string;
  winningFontWeight?: string;
  winningFontSize?: number;
  iconOffset?: number;
};

interface WunderWheelProps {
  items: WunderWheelItem[];
  wheelBackgroundColor?: string;
  knobFill?: string;
  winningSegmentColor?: string;
  onSpinEnd?: (winner: string, index: number) => void;
  minDeceleration?: number;
  maxDeceleration?: number;
}

/**
 *
 */
export default function WunderWheel({
  items,
  knobFill,
  wheelBackgroundColor,
  winningSegmentColor,
  onSpinEnd,
  minDeceleration,
  maxDeceleration,
}: WunderWheelProps) {
  // Validate props lengths match
  const numberOfSegments = items.length;
  const angleBySegment = oneTurn / numberOfSegments; // Degrees per segment
  const angleOffset = angleBySegment / 2; // Offset to center segments
  const NUMBER_OF_SEGMENTS = numberOfSegments;
  const SEGMENT_ANGLE = 360 / NUMBER_OF_SEGMENTS;

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

  // Creates the wheel segments using D3 for SVG path generation
  const makeWheel = (): WheelSegment[] => {
    const data = Array.from({ length: numberOfSegments }).fill(1) as number[];
    const arcs = d3Shape.pie()(data);
    return arcs.map((arc, index) => {
      if (items[index] === undefined) {
        throw new Error('Items and segments must have the same length');
      }
      const instance = d3Shape.arc().outerRadius(width / 2);
      return {
        path: instance({
          ...arc,
          outerRadius: width / 2,
          innerRadius: 0,
        }),
        color: items[index].segmentColor,
        value: items[index].value,
        centroid: instance.centroid({
          ...arc,
          outerRadius: width / 2,
          innerRadius: 0,
        }) as [number, number],
      };
    });
  };

  const wheelPaths = useRef(makeWheel()).current; // Store wheel segment data

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
      onSpinEnd?.(
        wheelPaths[winningSegmentIndex]?.value?.toString() || '',
        winningSegmentIndex
      );
    }
  }, [
    isFinished,
    currentRotation,
    wheelPaths,
    SEGMENT_ANGLE,
    numberOfSegments,
    onSpinEnd,
  ]);

  // Creates the wheel segments using D3 for SVG path generation

  // Handle pan gesture for spinning the wheel
  const onPan = ({ nativeEvent }: { nativeEvent: any }) => {
    if (nativeEvent.state === State.END) {
      // Reset states for new spin
      setEnabled(false);
      setWinner(null);
      setWinningIndex(null);
      const randomBetween =
        Math.random() * (minDeceleration || 0.99 - (maxDeceleration || 0.98)) +
        (maxDeceleration || 0.98);

      // Animate the wheel spin using decay animation
      angleRef.setValue(0);
      Animated.decay(angleRef, {
        velocity: nativeEvent.velocityY * 10,
        deceleration: randomBetween,
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

  // Render the main wheel component with segments
  const renderSvgWheel = () => {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 10,
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
        }}
      >
        {renderKnob()}
        <Animated.View
          style={{
            backgroundColor: wheelBackgroundColor,
            alignItems: 'center',
            borderRadius: width / 2,
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
                const isWinningSegment = i === winningIndex;
                const item = items[i];
                if (!item) {
                  throw new Error(
                    'Items and segments must have the same length'
                  );
                }
                return (
                  <G key={`arc-${i}`}>
                    <Path
                      d={arc.path || ''}
                      fill={
                        isWinningSegment
                          ? winningSegmentColor || arc.color
                          : arc.color
                      }
                    />
                    <ForeignObject
                      x={x + (item.iconOffset || 0)}
                      y={y - 10}
                      width={150}
                      height={40}
                      transform={`rotate(${(i * angleBySegment + angleOffset + 90) % 360}, ${x}, ${y})`}
                    >
                      {item.icon &&
                        React.cloneElement(item.icon as React.ReactElement, {
                          style: {
                            width: '100%',
                            height: '100%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isWinningSegment
                              ? item.winningFontColor || 'black'
                              : item.fontColor || 'black',
                          },
                        })}
                    </ForeignObject>
                    <ForeignObject
                      x={x - 90}
                      y={y - 15}
                      width={150}
                      height={40}
                      transform={`rotate(${(i * angleBySegment + angleOffset + 90) % 360}, ${x}, ${y})`}
                    >
                      {React.cloneElement(item.value as React.ReactElement, {
                        style: {
                          width: '100%',
                          height: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          fontWeight: item.fontWeight || 'normal',
                          fontSize: item.fontSize || 16,
                          color: isWinningSegment
                            ? item.winningFontColor || 'black'
                            : item.fontColor || 'black',
                        },
                      })}
                    </ForeignObject>
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
      <View style={styles.container}>{renderSvgWheel()}</View>
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

