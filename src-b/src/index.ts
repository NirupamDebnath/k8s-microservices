import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import pino from 'pino';
import dotenv from "dotenv";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;
const logger = pino();

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  logger.info({
    message: 'reqest received at path /',
    reqBody: req.body,
    reqHeader: req.headers,
    reqQuery: req.query,
  });
  res.status(200).json({
    status: 'Success',
    message: 'Response from svc-b',
    reqBody: req.body,
    reqHeader: req.headers,
    reqQuery: req.query,
  });
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
