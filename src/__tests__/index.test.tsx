import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import WunderWheel, { type WunderWheelItem } from '../index';
import { Text } from 'react-native';
import { State } from 'react-native-gesture-handler';

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

  it('calls onSpinEnd when the wheel stops', async () => {
    const onSpinEndMock = jest.fn();
    const { getByTestId } = render(
      <WunderWheel items={mockItems} onSpinEnd={onSpinEndMock} />
    );
  
    const wheel = getByTestId('wheel-svg-container');
  
    act(() => {
      fireEvent(wheel, 'onHandlerStateChange', {
        nativeEvent: {
          state: State.BEGAN,
          velocityY: 100,
        },
      });
    });

    act(() => {
      fireEvent(wheel, 'onHandlerStateChange', {
        nativeEvent: {
          state: State.END,
          velocityY: 0,
        },
      });
    });

    await waitFor(() => {
      expect(onSpinEndMock).toHaveBeenCalled();
    });
  });

  it('does not call onSpinEnd when the wheel is spinning', async () => {
    const onSpinEndMock = jest.fn();
    const { getByTestId } = render(
      <WunderWheel items={mockItems} onSpinEnd={onSpinEndMock} />
    );
  
    const wheel = getByTestId('wheel-svg-container');
  
    act(() => {
      fireEvent(wheel, 'onHandlerStateChange', {
        nativeEvent: {
          state: State.BEGAN,
          velocityY: 100,
        },
      });
    });

    await waitFor(() => {
      expect(onSpinEndMock).not.toHaveBeenCalled();
    });
  });
});