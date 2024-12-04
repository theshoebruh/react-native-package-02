import '@testing-library/jest-native/extend-expect';

jest.mock('d3-shape', () => {
  return {
    pie: () => jest.fn(),
    arc: () => jest.fn(),
  };
});

