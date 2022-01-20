import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';
import contants from '../constants';

export default class MongoWrapper{
    #url = 'mongodb://localhost:27017';
    #dbName = contants.MongoDBName;
    #client: MongoClient = null;
    async connect(){
        this.#client = new MongoClient(this.#url);
        return this.#client.connect();

    }
    async addPlayerScript(script: string){
        const playerId = uuid()
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.insertOne({ playerId, script });
    }
    async getAllPlayerScripts(){
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.find({}).toArray();
    }
    async playerExists(playerId: string){
        if (this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return collection.count({ playerId }, { limit: 1 }).then(result => !!result)

        }
    }
    initializeUnorderedBulkOpForPlayer(){
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return collection.initializeUnorderedBulkOp();
    }

}