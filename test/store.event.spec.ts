
import { Kafka, Producer } from 'kafkajs';
import { StoreEvent } from '../src/events/store.event';
import { DnaEventModel } from '../src/models/dnaEvent.model';
import redisClient from '../src/database/redisClient';

jest.mock('../src/database/redisClient', () => ({
  rPush: jest.fn(),
  lRange: jest.fn(),
}));

jest.mock('kafkajs');

describe('StoreEvent', () => {
  let storeEvent: StoreEvent;
  let kafkaProducerMock: jest.Mocked<Producer>;

  beforeEach(() => {
    kafkaProducerMock = {
      connect: jest.fn(),
      send: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as jest.Mocked<Producer>;

    const kafkaMock = {
      producer: jest.fn(() => kafkaProducerMock),
    };

    (Kafka as jest.Mock).mockImplementation(() => kafkaMock);

    storeEvent = new StoreEvent();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connectProducer', () => {
    it('should connect the Kafka producer', async () => {
      await storeEvent.connectProducer();

      expect(kafkaProducerMock.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if connection fails', async () => {
      kafkaProducerMock.connect.mockRejectedValueOnce(new Error('Connection error'));

      await expect(storeEvent.connectProducer()).rejects.toThrow('Error: Connection error');
    });
  });

  describe('save', () => {
    it('should save the event to Redis and Kafka', async () => {
      const mockEvent = new DnaEventModel('1', 'DNA_ANALYZED', { dna: ['AAAA'], isSpecial: true });

      await storeEvent.save(mockEvent);

      expect(redisClient.rPush).toHaveBeenCalledWith(
        'dna-event-1',
        JSON.stringify(mockEvent)
      );

      expect(kafkaProducerMock.connect).toHaveBeenCalledTimes(1);
      expect(kafkaProducerMock.send).toHaveBeenCalledWith({
        topic: 'dna-events',
        messages: [
          { key: '1', value: JSON.stringify(mockEvent) },
        ],
      });
    });

    it('should throw an error if saving to Redis or Kafka fails', async () => {
      const mockEvent = new DnaEventModel('1', 'DNA_ANALYZED', { dna: ['AAAA'], isSpecial: true });

      (redisClient.rPush as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));

      await expect(storeEvent.save(mockEvent)).rejects.toThrow('Error: Redis error');
    });
  });

  describe('getEvents', () => {
    it('should retrieve events from Redis', async () => {
      const mockEvents = [
        JSON.stringify(new DnaEventModel('1', 'DNA_ANALYZED', { dna: ['AAAA'], isSpecial: true })),
        JSON.stringify(new DnaEventModel('1', 'DNA_ANALYZED', { dna: ['CCCC'], isSpecial: false })),
      ];

      (redisClient.lRange as jest.Mock).mockResolvedValueOnce(mockEvents);

      const result = await storeEvent.getEvents('1');

      expect(redisClient.lRange).toHaveBeenCalledWith('dna-event-1', 0, -1);
      expect(result).toEqual(mockEvents.map(event => JSON.parse(event)));
    });

    it('should throw an error if retrieving from Redis fails', async () => {
      (redisClient.lRange as jest.Mock).mockRejectedValueOnce(new Error('Redis error'));

      await expect(storeEvent.getEvents('1')).rejects.toThrow('Error: Redis error');
    });
  });

  describe('disconnectProducer', () => {
    it('should disconnect the Kafka producer', async () => {
      await storeEvent.disconnectProducer();

      expect(kafkaProducerMock.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if disconnection fails', async () => {
      kafkaProducerMock.disconnect.mockRejectedValueOnce(new Error('Disconnect error'));

      await expect(storeEvent.disconnectProducer()).rejects.toThrow('Error: Disconnect error');
    });
  });
});
