import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';
import contants from '../constants';

export default class MongoWrapper{
    #url = 'mongodb://localhost:27017';
    #dbName = contants.MongoDBName;
    #client?: MongoClient = undefined;
    async connect(){
        this.#client = new MongoClient(this.#url);
        return this.#client.connect();

    }
    async getPlayerScript(playerId: string){
        if (this.#client) {
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return await collection.find({playerId}).toArray();
        }
    }
    async addPlayerScript(script: string){
        const playerId = uuid()
        if(this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return await collection.insertOne({ playerId: playerId, script, position: {x: 20, y: 20} });
        }
    }
    async editPlayerScript(playerId: string, script:string){
        if(this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return await collection.updateOne({ playerId: playerId }, {$set: {script}});
        }
    }
    async getAllPlayerScripts(){
        if (this.#client) {
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return await collection.find({}).toArray();
        }
    }
    async playerExists(playerId: string){
        if (this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection(contants.MongoPlayerCollectionName);
            return collection.count({ playerId }, { limit: 1 }).then(result => !!result)

        }
    }
}