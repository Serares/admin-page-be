import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import { createProxyMiddleware } from "http-proxy-middleware";
import MongoDBStore from "connect-mongodb-session";
import { MONGO_DB, MONGO_DB_SESSION_DB, GCS_BUCKET } from "./utils/secrets";
import bodyParser from 'body-parser';
import { AuthRouter } from './routes/auth';
import { PropertiesRouter } from './routes/properties';
import CustomError from "./classes/CustomError";

export class App {
    private _MongoURI: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-xyshh.mongodb.net/${MONGO_DB}`;
    private _mongoDBStore = MongoDBStore(session);
    private _app: express.Application;
    private store: any;
    private authRouter: AuthRouter;
    private propertiesRouter: PropertiesRouter;

    get MongoURI(): string {
        return this._MongoURI;
    }

    get app(): express.Application {
        return this._app;
    }

    constructor() {
        this._app = express();
        this.authRouter = new AuthRouter();
        this.propertiesRouter = new PropertiesRouter();
        // setting the communication with database and session
        this.store = new this._mongoDBStore({
            uri: this._MongoURI,
            collection: MONGO_DB_SESSION_DB
        });

        this.config();

        // this._app.use(this.propertiesRouter.router);
        // AUTH ENDPOINTS
        this._app.use(this.authRouter.router);
    }

    private config(): void {
        this._app.use(bodyParser.json());

        this._app.set("trust proxy", true);

        const tomorrowDate = new Date();
        tomorrowDate.setDate(new Date().getDate() + 1);
        // use plug-ins for the app
        //configuration for sessions and cookies
        //TODO make all callback functions private methods
        // private session: void {}
        this._app.use(session({
            secret: process.env.SESSION_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 90,
                // SOLVED A BUG HERE
                // without TS i would add a number, and the sessions would expire after a very long time
                expires: tomorrowDate
            },
            resave: false,
            saveUninitialized: false,
            store: this.store
        }));

        this._app.use((req: Request, res: Response, next: NextFunction) => {
            //DON'T FORGET TO UNCOMMENT THIS IN PRODUCTION
            //TODO set admin page in a separate URL and use the cors stuff only for MVC
            //this does not send a response just sets a Header
            // you can lock cors to one domain 'exampledomain.com'
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });

        // TODO create a proxy to serve files like s3 proxy
        this._app.use(createProxyMiddleware(
            "/images",
            {
                target: `https://storage.googleapis.com/${GCS_BUCKET}`,
                changeOrigin: true
            })
        );

        // TODO add this error handler in error controller
        this._app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
            console.log("Error", error);
            console.log("Validation Errors", error.errors);

            res.status(error.statusCode).json({ message: "Error", error: error.message });
        });
    }
}
