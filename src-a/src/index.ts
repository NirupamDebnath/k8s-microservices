import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import pino from 'pino';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino();

app.use(bodyParser.json());

const API_B_URL = process.env.API_B_URL || 'http://localhost:3001';
const API_C_URL = process.env.API_C_URL || 'http://localhost:3002';

app.get('/', async (req: Request, res: Response) => {
  logger.info({
    message: 'reqest received at path /',
    reqBody: req.body,
    reqHeader: req.headers,
    reqQuery: req.query,
  });

  const randomValue = Math.random(); // Generates a random number between 0 and 1

  try {
    if (randomValue < 0.3) {
      const response = await callApiB(); // 30% probability
      logger.info({message: 'Called API B', data: response.data});
      res.json({message: 'Called API B', data: response.data});
    } else {
      const response = await callApiC(); // 70% probability
      logger.info({message: 'Called API C', data: response.data});
      res.json({message: 'Called API C', data: response.data});
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error({message: 'Failed to call API', error: errorMessage});
    res.status(500).json({error: errorMessage});
  }
});

app.listen(PORT, (error?: Error) => {
  if (!error) {
    console.log(
      `Server is Successfully Running, and App is listening on port ${PORT}`,
    );
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

async function callApiB() {
  logger.info('Calling API A');
  return axios.get(API_B_URL); // Fetch from .env-configured URL
}

async function callApiC() {
  logger.info('Calling API B');
  return axios.get(API_C_URL); // Fetch from .env-configured URL
}
