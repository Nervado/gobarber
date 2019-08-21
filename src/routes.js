import { Router } from 'express';

import UserControllers from './app/controllers/UserControllers';

const routes = new Router();

routes.post('/users', UserControllers.store);

export default routes;
