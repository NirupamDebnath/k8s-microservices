import express, {Request, Response} from 'express';
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Success',
    message: 'Response from src-a',
    reqBody: req.body,
    reqHeader: req.headers,
    reqQuery: req.query
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
