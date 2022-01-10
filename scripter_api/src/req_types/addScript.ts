import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';

export default interface IAddScriptRequestObject {
    script: string;
}