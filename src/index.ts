import { Express, Request, Response } from 'express'
import * as express from "express"

const app: Express = express()
const port = 8080;

app.get('/healthCheck', (_: Request, res: Response) => {
    res.status(200).send()
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})