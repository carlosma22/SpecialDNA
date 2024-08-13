import { Kafka, EachMessagePayload } from 'kafkajs';
import { ReplayerEvent } from '../src/events/replayer.event';
import { StoreEvent } from '../src/events/store.event';
import { DnaEventEntity } from '../src/entities/dnaEvent.entity';

jest.mock('kafkajs');
jest.mock('../src/events/store.event');

describe('ReplayerEvent', () => {
  let replayerEvent: ReplayerEvent;
  let kafkaConsumerMock: any;
  let storeEventMock: jest.Mocked<StoreEvent>;

  beforeEach(() => {
    kafkaConsumerMock = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
      disconnect: jest.fn(),
    };

    const kafkaMock = {
      consumer: jest.fn(() => kafkaConsumerMock),
    };

    (Kafka as jest.Mock).mockImplementation(() => kafkaMock);

    storeEventMock = new StoreEvent() as jest.Mocked<StoreEvent>;
    replayerEvent = new ReplayerEvent(storeEventMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connectConsumer', () => {
    it('should connect and subscribe to Kafka topic', async () => {
      await replayerEvent.connectConsumer();

      expect(kafkaConsumerMock.connect).toHaveBeenCalledTimes(1);
      expect(kafkaConsumerMock.subscribe).toHaveBeenCalledWith({
        topic: 'dna-events',
        fromBeginning: true,
      });
    });

    it('should throw an error if connecting or subscribing fails', async () => {
      kafkaConsumerMock.connect.mockRejectedValueOnce(new Error('Connection error'));

      await expect(replayerEvent.connectConsumer()).rejects.toThrow('Error: Connection error');
    });
  });

  describe('replay', () => {
    it('should replay DNA_ANALYZED event and return the data', async () => {
      const mockEvent = new DnaEventEntity('1', 'DNA_ANALYZED', { dna: ['AAAA'], isSpecial: true });

      kafkaConsumerMock.run.mockImplementationOnce(async ({ eachMessage }: any) => {
        await eachMessage({
          topic: 'dna-events',
          partition: 0,
          message: {
            value: Buffer.from(JSON.stringify(mockEvent)),
          },
        } as EachMessagePayload);
      });

      const result = await replayerEvent.replay('1');

      expect(result).toEqual({ dna: ['AAAA'], isSpecial: true });
      expect(kafkaConsumerMock.connect).toHaveBeenCalledTimes(1);
      expect(kafkaConsumerMock.disconnect).toHaveBeenCalledTimes(0);
    });

    it('should return default data if no matching event is found', async () => {
      kafkaConsumerMock.run.mockImplementationOnce(async ({ eachMessage }: any) => {
        await eachMessage({
          topic: 'dna-events',
          partition: 0,
          message: {
            value: Buffer.from(''),
          },
        } as EachMessagePayload);
      });

      const result = await replayerEvent.replay('1');

      expect(result).toEqual({ dna: [], isSpecial: false });
    });

    it('should throw an error if replay fails', async () => {
      kafkaConsumerMock.run.mockRejectedValueOnce(new Error('Replay error'));

      const result = await replayerEvent.replay('1');

      expect(result).toEqual({ dna: [], isSpecial: false });
    });
  });

  describe('disconnectConsumer', () => {
    it('should disconnect from Kafka', async () => {
      await replayerEvent.disconnectConsumer();

      expect(kafkaConsumerMock.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if disconnect fails', async () => {
      kafkaConsumerMock.disconnect.mockRejectedValueOnce(new Error('Disconnect error'));

      await expect(replayerEvent.disconnectConsumer()).rejects.toThrow('Error: Disconnect error');
    });
  });
});
