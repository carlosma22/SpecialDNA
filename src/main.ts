import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { DnaController } from './controllers/dna.controller';
import { StoreEvent } from './events/store.event';
import { ReplayerEvent } from './events/replayer.event';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from '../swaggerConfig';
import dotenv from 'dotenv';
dotenv.config();

export const appDataSource = new DataSource({
  type: process.env.DATABASE_CLIENT as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '0'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/models/*.ts'],
  synchronize: false
});

const storeEvent = new StoreEvent();
const replayerEvent = new ReplayerEvent(storeEvent);

async function initializeKafka() {
  await storeEvent.connectProducer();
  await replayerEvent.connectConsumer();
}

async function shutdownKafka() {
  await storeEvent.disconnectProducer();
  await replayerEvent.disconnectConsumer();
}

const app = express();
app.use(express.json());
const swaggerSpec = swaggerJsdoc(swaggerOptions);
const dnaController = new DnaController();
const port = process.env.PORT;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post('/dna-special', (req, res) => dnaController.analyzeDna(req, res));
app.get('/dashboard', (req, res) => dnaController.getDnaStats(req, res));

app.listen(port, async () => {
  await appDataSource.initialize();
  await initializeKafka();
  console.log(`Server is running on port ${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});

process.on('SIGTERM', async () => {
  await shutdownKafka();
  process.exit(0);
});