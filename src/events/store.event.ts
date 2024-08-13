import { Kafka } from 'kafkajs';
import redisClient from '../database/redisClient';
import { DnaEventModel } from '../models/dnaEvent.model';

export class StoreEvent {
    private readonly EVENT_PREFIX = 'dna-event-';
    private kafkaProducer;
    private kafkaClientIdStore = 'dna-event-store';
    private kafkaBrokers = 'localhost:9092';
    private kafkaTopic = 'dna-events';

    constructor() {
        const kafka = new Kafka({
            clientId: this.kafkaClientIdStore,
            brokers: [this.kafkaBrokers],
        });

        this.kafkaProducer = kafka.producer();
    }

    async connectProducer() {
        try {
            await this.kafkaProducer.connect();
        } catch (error: any) {
            throw Error(`Error: ${error.message || error}`);
        }
    }

    async save(event: DnaEventModel): Promise<void> {
        try {
            const key = `${this.EVENT_PREFIX}${event.id}`;

            await redisClient.rPush(key, JSON.stringify(event));

            await this.kafkaProducer.connect();
            await this.kafkaProducer.send({
                topic: this.kafkaTopic,
                messages: [
                    { key: event.id.toString(), value: JSON.stringify(event) },
                ],
            });
        } catch (error: any) {
            throw Error(`Error: ${error.message || error}`);
        }
    }

    async getEvents(id: string): Promise<DnaEventModel[]> {
        try {
            const key = `${this.EVENT_PREFIX}${id}`;
            const events = await redisClient.lRange(key, 0, -1);
            return events.map(event => JSON.parse(event) as DnaEventModel);
        } catch (error: any) {
            throw Error(`Error: ${error.message || error}`);
        }
    }

    async disconnectProducer() {
        try {
            await this.kafkaProducer.disconnect();
        } catch (error: any) {
            throw Error(`Error: ${error.message || error}`);
        }
    }
}
