import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import auth from './app/middleware/auth';

const routes = new Router();

// Create user
routes.post('/users', UserController.store);
// Login user
routes.post('/sessions', SessionController.store);
// Auth user
routes.use(auth);
// Modify user
routes.put('/users', UserController.update);

export default routes;
