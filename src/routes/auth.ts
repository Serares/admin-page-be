import { Router, Express } from 'express';
import { AuthController } from '../controllers/auth';

export class AuthRouter {
    // TODO try to create a Interface or Abstract class for Router 
    // TODO create interface for controller, try to abstractize the controller property
    private _router: Router = Router();
    private _controller: AuthController = new AuthController();

    constructor() {
        this.config();
        this.initializeRoutes();
    }

    get router(): Router {
        return this._router;
    }

    private initializeRoutes(): void {
        this._router.put("/signup", this._controller.signup);
        this._router.post("/login", this._controller.login);
        this._router.post("/logout", this._controller.logout);
    }

    private config(): void {

    }
} 
