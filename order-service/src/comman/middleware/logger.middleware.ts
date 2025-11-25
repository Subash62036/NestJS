import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

    use(req: Request, res: Response, next: NextFunction) {

        const { method, originalUrl } = req;
        const start = Date.now();

        // Checkng directory existence or not
        const logDir = path.join(process.cwd(), '/logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }


        const responseTime = Date.now() - start;
        const logFile = `[${method}] ${originalUrl} - ${res.statusCode} (${responseTime}ms) - ${new Date().toISOString()}`;
        console.log(logFile);
        fs.appendFile(path.join(logDir, 'requests.log'), logFile + '\n', (err) => {
            if (err) {
                console.error('Failed to write log:', err);
            }
        });

        next();


    }
}