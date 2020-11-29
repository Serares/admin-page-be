import { Router } from 'express';
import { PropertiesController } from '../controllers/properties';

export class PropertiesRouter {
    // TODO try to create a Interface or Abstract class for Router 
    // TODO create interface for controller, try to abstractize the controller property
    private _router: Router = Router();
    private _controller: PropertiesController = new PropertiesController();

    constructor() {
        this.config();
        this.initializeRoutes();
    }

    get router(): Router {
        return this._router;
    }

    private initializeRoutes(): void {
        this._router.get("/properties", this._controller.properties);
    }

    private config(): void {

    }
} 
