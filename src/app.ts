import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import { MONGO_DB, MONGO_DB_SESSION_DB, S3_BUCKET } from "./utils/secrets";
import s3proxy from "s3-proxy";
import bodyParser from 'body-parser';
import { AuthRouter } from './routes/auth';
import { PropertiesRouter } from './routes/properties';

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

        //TODO add the endpoints in separate files
        this._app.use(this.propertiesRouter.router);
        // AUTH ENDPOINTS
        this._app.use(this.authRouter.router);
    }

    private config(): void {
        this._app.use(bodyParser.json());

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

        this._app.get("/images/*", s3proxy({
            bucket: S3_BUCKET,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            overrideCacheControl: "max-age=2592000"
        }));

        // TODO add this error handler in error controller
        this._app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            console.log("Error", error);
            // res.status(500).render('500', {
            //     pageTitle: 'Error!',
            //     path: '/500',
            //     isAuthenticated: false
            // });
            res.status(error.statusCode).json({ message: "Erorare", error: error });
        });
    }
}
