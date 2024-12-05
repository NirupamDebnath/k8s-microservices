import express, {Request, Response} from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'Success',
    message: 'Response from src-a',
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
