import { Request, Response, NextFunction } from 'express';
import { Property } from "../models/property";

export class PropertiesController {
    public async properties(req: Request, res: Response, next: NextFunction): Promise<void> {
        /*
            send an object with all properties added in db
        */

        try {
            const properties = await Property.find();
            if (!properties) {
                const error = new Error("No properties in the DB");
                throw error;
            }
            // console.log("Found properties", properties);
            res.status(200).json({ message: "Properties that you requested", properties: properties });
        } catch (err) {
            console.log("An error occured ", err);
            // TODO create a method to handle error in here
            const error = new Error("Cant fetch properties");
            next(error);
        }
    }

}