import cors from "cors";
import {env} from "../env";
import express from "express";

export function useCors(app: express.Application) {
    const whitelist = [env.app.apiOrigin];

    const options: cors.CorsOptions = {
        origin: whitelist,
        credentials: true
    }

    app.use(cors(options))
}