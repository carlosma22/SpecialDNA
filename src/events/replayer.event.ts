import { Kafka } from 'kafkajs';
import { DnaEventEntity } from '../entities/dnaEvent.entity';
import { StoreEvent } from './store.event';

export class ReplayerEvent {
  private storeEvent: StoreEvent;
  private kafkaConsumer;
  private kafkaClientIdReplayer = 'dna-event-replayer';
  private kafkaBrokers = 'localhost:9092';
  private kafkaGroupIdReplayer = 'dna-event-replayers';
  private kafkaTopic = 'dna-events';

  constructor(storeEvent?: StoreEvent) {
    this.storeEvent = storeEvent || new StoreEvent();

    const kafka = new Kafka({
      clientId: this.kafkaClientIdReplayer,
      brokers: [this.kafkaBrokers],
    });

    this.kafkaConsumer = kafka.consumer({ groupId: this.kafkaGroupIdReplayer });
  }

  async connectConsumer() {
    try {
      await this.kafkaConsumer.connect();
      await this.kafkaConsumer.subscribe({ topic: this.kafkaTopic, fromBeginning: true });
    } catch (error: any) {
        throw Error(`Error: ${error.message || error}`);
    }
  }

  async replay(id: string): Promise<any> {
    try {
      await this.connectConsumer();

      let dnaData = { dna: [], isSpecial: false };

      await this.kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const event: DnaEventEntity = JSON.parse(message?.value?.toString() || '');

          if (event.id === id) {
            switch (event.eventType) {
              case 'DNA_ANALYZED':
                dnaData = event.data;
                break;
            }
          }
        },
      });

      return dnaData;
    } catch (error: any) {
      return { dna: [], isSpecial: false };
    }
  }

  async disconnectConsumer() {
    try {
      await this.kafkaConsumer.disconnect();
    } catch (error: any) {
      throw Error(`Error: ${error.message || error}`);
    }
  }
}
