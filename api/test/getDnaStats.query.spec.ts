import { appDataSource } from "../src/main";
import { GetDnaStatsQuery } from "../src/queries/getDnaStats.query";


jest.mock('../src/main', () => ({
  appDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('GetDnaStatsQuery', () => {
  let getDnaStatsQuery: GetDnaStatsQuery;
  let mockRepository: any;

  beforeEach(() => {
    getDnaStatsQuery = new GetDnaStatsQuery();
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    };
    (appDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  it('should return correct statistics when data is present', async () => {
    const mockResult = {
      count_special_dna: '5',
      count_ordinary_dna: '10',
    };

    mockRepository.getRawOne.mockResolvedValue(mockResult);

    const result = await getDnaStatsQuery.execute();

    expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('Dna');
    expect(mockRepository.select).toHaveBeenCalledWith(
      "SUM(CASE WHEN isSpecial = TRUE THEN 1 ELSE 0 END)",
      "count_special_dna"
    );
    expect(mockRepository.addSelect).toHaveBeenCalledWith(
      "SUM(CASE WHEN isSpecial = FALSE THEN 1 ELSE 0 END)",
      "count_ordinary_dna"
    );
    expect(result).toEqual({
      count_special_dna: 5,
      count_ordinary_dna: 10,
      ratio: 0.5,
    });
  });

  it('should handle division by zero when no ordinary DNA is found', async () => {
    const mockResult = {
      count_special_dna: '5',
      count_ordinary_dna: '0',
    };

    mockRepository.getRawOne.mockResolvedValue(mockResult);

    const result = await getDnaStatsQuery.execute();

    expect(result).toEqual({
      count_special_dna: 5,
      count_ordinary_dna: 0,
      ratio: 0,
    });
  });

  it('should handle cases where the database returns null values', async () => {
    const mockResult = {
      count_special_dna: null,
      count_ordinary_dna: null,
    };

    mockRepository.getRawOne.mockResolvedValue(mockResult);

    const result = await getDnaStatsQuery.execute();

    expect(result).toEqual({
      count_special_dna: 0,
      count_ordinary_dna: 0,
      ratio: 0,
    });
  });
});
