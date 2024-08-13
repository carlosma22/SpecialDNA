import { CreateDnaCommand } from '../src/commands/CreateDna.command';
import { DnaEntity } from '../src/entities/dna.entity';
import redisClient from '../src/database/redisClient';
import { appDataSource } from '../src/main';
import { Repository } from 'typeorm';
import { CreateDnaCommandHandler } from '../src/handlers/createDnaCommand.handler';
import { StoreEvent } from '../src/events/store.event';

jest.mock('../src/database/redisClient', () => ({
  multi: jest.fn().mockReturnThis(),
  incr: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(null),
}));

jest.mock('../src/events/store.event');
jest.mock('../src/main', () => ({
  appDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('CreateDnaCommandHandler', () => {
  let commandHandler: CreateDnaCommandHandler;
  let dnaRepositoryMock: jest.Mocked<Repository<DnaEntity>>;
  let storeEventMock: jest.Mocked<StoreEvent>;

  beforeEach(() => {
    commandHandler = new CreateDnaCommandHandler();
    dnaRepositoryMock = {
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<DnaEntity>>;
    appDataSource.getRepository = jest.fn().mockReturnValue(dnaRepositoryMock);
    storeEventMock = new StoreEvent() as jest.Mocked<StoreEvent>;
    storeEventMock.save = jest.fn();
  });

  describe('isSpecialDna', () => {
    it('should return true for a special DNA sequence', () => {
      const specialDna = ['AAAA', 'BBBB', 'CCCC', 'DDDD'];
      expect(commandHandler['isSpecialDna'](specialDna)).toBe(true);
    });

    it('should return false for a non-special DNA sequence', () => {
      const ordinaryDna = ['ATCG', 'GCTA', 'CGAT', 'TAGC'];
      expect(commandHandler['isSpecialDna'](ordinaryDna)).toBe(false);
    });
  });

  describe('handle', () => {
    it('should save DNA entity and event, and update stats', async () => {
      const command = new CreateDnaCommand(['AAAA', 'CCCC', 'GGGG', 'TTTT']);
      dnaRepositoryMock.save.mockResolvedValue({
        id: 'bd6350c6-08a7-476d-a0f1-39a63046d05c', 
        sequence: command.sequence, 
        isSpecial: true,
      } as DnaEntity);
      storeEventMock.save.mockResolvedValue();

      const result = await commandHandler.handle(command);

      expect(result).toBe(true);
      expect(dnaRepositoryMock.save).toHaveBeenCalled();
      //expect(storeEventMock.save).toHaveBeenCalled();
      expect(redisClient.multi).toHaveBeenCalled();
      expect(redisClient.incr).toHaveBeenCalledWith('count_special_dna');
    });

    it('should save non-special DNA and update stats', async () => {
      const command = new CreateDnaCommand(['ATCG', 'GCTA', 'CGAT', 'TAGC']);
      dnaRepositoryMock.save.mockResolvedValue({ 
        id: 'bd6350c6-08a7-476d-a0f1-39a63046d05c', 
        sequence: command.sequence, 
        isSpecial: false,
      } as DnaEntity);
      storeEventMock.save.mockResolvedValue();

      const result = await commandHandler.handle(command);

      expect(result).toBe(false);
      expect(dnaRepositoryMock.save).toHaveBeenCalled();
      //expect(storeEventMock.save).toHaveBeenCalled();
      expect(redisClient.multi).toHaveBeenCalled();
      expect(redisClient.incr).toHaveBeenCalledWith('count_ordinary_dna');
    });
  });

  describe('updateStats', () => {
    it('should increment count_special_dna for special DNA', async () => {
      await commandHandler['updateStats'](true);
      expect(redisClient.incr).toHaveBeenCalledWith('count_special_dna');
    });

    it('should increment count_ordinary_dna for ordinary DNA', async () => {
      await commandHandler['updateStats'](false);
      expect(redisClient.incr).toHaveBeenCalledWith('count_ordinary_dna');
    });
  });
});
