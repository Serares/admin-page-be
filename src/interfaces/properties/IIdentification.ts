import { Schema } from 'mongoose';

export interface IIdentification {
    alias?: number;
    // uuid
    id: string;
    // this is the agent that will be contacted
    agent: Schema.Types.ObjectId;
    // this is the agent that posted the property
    postedBy: Schema.Types.ObjectId;
    // owner telephone, or name
    ownerData?: string;
}