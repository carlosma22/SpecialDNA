import redisClient from '../src/database/redisClient';
import { GetDnaStatsQueryHandler } from '../src/handlers/getDnaStatsQuery.handler';
import { GetDnaStatsQuery } from '../src/queries/getDnaStats.query';

jest.mock('../src/database/redisClient', () => ({
  get: jest.fn(),
  set: jest.fn().mockResolvedValue({
    count_special_dna: 8,
    count_ordinary_dna: 4,
  }),
}));

jest.mock('../src/queries/getDnaStats.query', () => ({
  GetDnaStatsQuery: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      count_special_dna: 8,
      count_ordinary_dna: 4,
    }),
  })),
}));

describe('GetDnaStatsQueryHandler', () => {
  let handler: GetDnaStatsQueryHandler;
  let getDnaStatsQueryMock: jest.Mocked<GetDnaStatsQuery>;

  beforeEach(() => {
    handler = new GetDnaStatsQueryHandler();
    getDnaStatsQueryMock = new GetDnaStatsQuery() as jest.Mocked<GetDnaStatsQuery>;
  });

  it('should return stats from Redis if available', async () => {
    redisClient.get = jest.fn()
      .mockResolvedValueOnce('10')  // count_special_dna
      .mockResolvedValueOnce('5');  // count_ordinary_dna

    const result = await handler.handle();

    expect(result).toEqual({
      count_special_dna: 10,
      count_ordinary_dna: 5,
      ratio: 2.00,
    });
    expect(redisClient.get).toHaveBeenCalledTimes(2);
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(getDnaStatsQueryMock.execute).not.toHaveBeenCalled();
  });

  it('should fetch stats from database if Redis returns null and cache the result', async () => {
    redisClient.get = jest.fn()
      .mockResolvedValueOnce(null)  // count_special_dna
      .mockResolvedValueOnce(null); // count_ordinary_dna
    
    getDnaStatsQueryMock.execute.mockResolvedValue({
      count_special_dna: 8,
      count_ordinary_dna: 4,
      ratio: 2.00,
    });

    const result = await handler.handle();

    expect(result).toEqual({
      count_special_dna: 8,
      count_ordinary_dna: 4,
      ratio: 2.00,
    });

    expect(redisClient.get).toHaveBeenCalledTimes(2);
    expect(redisClient.get).toHaveBeenNthCalledWith(1, 'count_special_dna');
    expect(redisClient.get).toHaveBeenNthCalledWith(2, 'count_ordinary_dna');
    expect(redisClient.set).toHaveBeenCalledTimes(2);
    expect(redisClient.set).toHaveBeenCalledWith('count_special_dna', '8');
    expect(redisClient.set).toHaveBeenCalledWith('count_ordinary_dna', '4');
  });

  it('should handle cases where database stats are zero to avoid division by zero', async () => {
    redisClient.get = jest.fn()
      .mockResolvedValueOnce('0')  // count_special_dna
      .mockResolvedValueOnce('0'); // count_ordinary_dna

    const result = await handler.handle();

    expect(result).toEqual({
      count_special_dna: 0,
      count_ordinary_dna: 0,
      ratio: 0.00,
    });
    expect(redisClient.get).toHaveBeenCalledTimes(2);
    expect(getDnaStatsQueryMock.execute).not.toHaveBeenCalled();
  });

  it('should throw an error if fetching from Redis fails', async () => {
    redisClient.get = jest.fn()
      .mockRejectedValue(new Error('Redis error'));

    await expect(handler.handle()).rejects.toThrow('Redis error');
    expect(redisClient.get).toHaveBeenCalledTimes(1);
    expect(getDnaStatsQueryMock.execute).not.toHaveBeenCalled();
  });
  
  it('should throw an error if fetching stats from database fails', async () => {
    redisClient.get = jest.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    
    expect(redisClient.get).toHaveBeenCalledTimes(0);
    expect(redisClient.set).toHaveBeenCalled();
  });
});
