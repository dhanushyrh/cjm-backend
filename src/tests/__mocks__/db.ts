const mockQuery = jest.fn(); // Mocked query function

const mockPool = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue({ query: mockQuery, release: jest.fn() }),
};

jest.mock("pg", () => {
  return { Pool: jest.fn(() => mockPool) };
});

export default mockQuery;
