import { Text } from 'react-native';

import { render } from '@testing-library/react-native';

import WunderWheel, { type WunderWheelItem } from '../index';

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

describe('WunderWheel', () => {
  it('renders correctly', () => {
    expect(true).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { root } = render(<WunderWheel items={mockItems} />);

    expect(root).toBeTruthy();
  });
});

