import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Request, Response, NextFunction } from 'express';

export class AuthController {
    public signup(req: Request, res: Response, next: NextFunction): void {
        console.log("Signed up");
        const errors = validationResult(req);
        //isEmpty  is a validationResult function
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            // error.statusCode = 422;
            // error.errors = errors.array();
            //this will exit the function and go the the error handling function from express
            // will work here because it's synchronous
            throw error;
            // return res.status(422).json({ message: 'Not valid', errors: errors.array() })
        }

        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: email,
                    name: name,
                    password: hashedPassword
                })
                return user.save();
            })
            .then(response => {
                res.status(201).json({
                    message: "User creted succesfully",
                    response: response
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                // throw will not work in a promise here
                // because it's async
                //throw err
                next(err);
            })
    }

    public login(req: Request, res: Response, next: NextFunction): void {
        // TODO send the users to the dashboard for approval
        const email = req.body.email;
        const password = req.body.password;
        const errors = validationResult(req);
        let loadedUser: any;
        User.findOne({ email: email })
            .then(user => {
                //user can be undefined
                if (!user) {
                    if (!errors.isEmpty()) {
                        const error = new Error('User is not in the data base');
                        // error.statusCode = 401;
                        throw error;
                    }
                }
                loadedUser = user;
                return bcrypt.compare(password, user.password);
            })
            .then(isEqual => {
                // bcrypt returns a promise
                if (!isEqual) {
                    // for test purpose 
                    // but on login validation is better to not tell which one is not correct
                    const error = new Error('Password is not good');
                    // error.statusCode = 401;
                    throw error;
                };
                // TODO you can set the token to not expire if the user selects "REMEMBER ME" in login page
                // creating jwt
                // adding data to token
                const token = jwt.sign(
                    {
                        email: loadedUser.email,
                        userId: loadedUser._id.toString()
                    },
                    // here we have a secret token that can't be faked on the client
                    process.env.SOCKET_SECRET_TOKEN,
                    { expiresIn: '1h' });

                res.status(200).json({ message: "Logged in success", token: token, userId: loadedUser._id.toString() });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                // throw will not work in a promise here
                // because it's async
                //throw err
                next(err);
            })
    }

    public logout(req: Request, res: Response, next: NextFunction): void {

    }
}