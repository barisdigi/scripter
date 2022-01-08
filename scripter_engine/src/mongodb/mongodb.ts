import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';

export default class MongoWrapper{
    #url = 'mongodb://localhost:27017';
    #dbName = "playerScripts";
    #client: MongoClient = null;
    async connect(){
        this.#client = new MongoClient(this.#url);
        return this.#client.connect();

    }
    async addPlayerScript(script: string){
        const playerId = uuid()
        const db = this.#client.db(this.#dbName);
        const collection = db.collection('playerScripts');
        return await collection.insertOne({ id: playerId, script });
    }
    async getAllPlayerScripts(){
        const db = this.#client.db(this.#dbName);
        const collection = db.collection('playerScripts');
        return await collection.find({}).toArray();
    }
}