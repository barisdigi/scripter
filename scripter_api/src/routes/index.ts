import { Application } from 'express-ws';
import client from '../../../shared/mongodb/client';
import UserRoutes from './users.route'

function useAllRoutes(app: Application, mongoClient: client){
    UserRoutes(app, mongoClient)
}
export default useAllRoutes;