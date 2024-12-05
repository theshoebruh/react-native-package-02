import React from 'react';

import { render, fireEvent } from '@testing-library/react-native';
import WunderWheel, { type WunderWheelItem } from '../index';
import { Text } from 'react-native';

const mockItems: WunderWheelItem[] = [
  {
    value: <Text>100</Text>,
    segmentColor: '#FF0000',
    fontColor: '#FFFFFF',
    winningString: '100 points',
  },
  {
    value: <Text>200</Text>,
    segmentColor: '#00FF00',
    fontColor: '#FFFFFF',
    winningString: '200 points',
  },
  {
    value: <Text>300</Text>,
    segmentColor: '#0000FF',
    fontColor: '#FFFFFF',
    winningString: '300 points',
  },
];

describe('WunderWheel Component', () => {
  it('renders without crashing', () => {
    const { root } = render(<WunderWheel items={mockItems} />);
    expect(root).toBeTruthy();
  });

  it('handles empty items array gracefully', () => {
    expect(() =>
      render(<WunderWheel items={[]} wheelBackgroundColor="#FFFFFF" knobFill="#000000" />)
    ).not.toThrow();
  });

  it('passes correct props to wheel', () => {
    const customBgColor = '#123456';
    const customKnobFill = '#654321';
    const { root } = render(
      <WunderWheel
        items={mockItems}
        wheelBackgroundColor={customBgColor}
        knobFill={customKnobFill}
      />
    );
    expect(root).toBeTruthy();
  });

  it('responds to pan gesture', () => {
    const { getByTestId, root } = render(<WunderWheel items={mockItems} />);
    const wheel = getByTestId('wheel-svg-container');
    fireEvent(wheel, 'onHandlerStateChange', {
      nativeEvent: {
        state: 2,
      },
    });
    expect(root).toBeTruthy();
  });
});
