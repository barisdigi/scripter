import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';

export default class MongoWrapper{
    #url = 'mongodb://localhost:27017';
    #dbName = "playerScripts";
    #client?: MongoClient = undefined;
    async connect(){
        this.#client = new MongoClient(this.#url);
        return this.#client.connect();

    }
    async getPlayerScript(id: string){
        if (this.#client) {
            const db = this.#client.db(this.#dbName);
            const collection = db.collection('playerScripts');
            return await collection.find({id}).toArray();
        }
    }
    async addPlayerScript(id: string, script: string){
        const playerId = uuid()
        if(this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection('playerScripts');
            return await collection.insertOne({ id: id, script });
        }
    }
    async editPlayerScript(id:string, script:string){
        const playerId = uuid()
        if(this.#client){
            const db = this.#client.db(this.#dbName);
            const collection = db.collection('playerScripts');
            return await collection.updateOne({ id: id }, {$set: {script}});
        }
    }
    async getAllPlayerScripts(){
        if (this.#client) {
            const db = this.#client.db(this.#dbName);
            const collection = db.collection('playerScripts');
            return await collection.find({}).toArray();
        }
    }
}