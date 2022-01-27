import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid';
import contants from '../constants/constants';
import { Map } from './schemas/map'
export default class MongoWrapper {
    #url = 'mongodb://localhost:27017';
    #dbName = contants.MongoDBName;
    #client: MongoClient = undefined;
    async connect() {
        this.#client = new MongoClient(this.#url);
        return this.#client.connect();

    }
    async getPlayer(playerId: string) {
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.find({ playerId }).toArray();

    }
    async getMap(mapId: string): Promise<Map> {
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoMapCollectionname);
        return (await collection.find({ mapId }).toArray()).at(0) as unknown as Map;
    }
    async addPlayerScript(script: string) {
        const playerId = uuid()

        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.insertOne({ playerId, script, position: { x: 20, y: 20 } });

    }
    async editPlayerScript(playerId: string, script: string) {

        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.updateOne({ playerId }, { $set: { script } });

    }
    async getAllPlayerScripts() {

        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return await collection.find({}).toArray();

    }
    async playerExists(playerId: string) {

        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return collection.count({ playerId }, { limit: 1 }).then(result => !!result)


    }
    initializeUnorderedBulkOpForPlayer() {
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(contants.MongoPlayerCollectionName);
        return collection.initializeUnorderedBulkOp();
    }
}