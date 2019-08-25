import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import auth from './app/middleware/auth';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';

const routes = new Router();
const upload = multer(multerConfig);

// Create user
routes.post('/users', UserController.store);
// Login user
routes.post('/sessions', SessionController.store);
// Auth user
routes.use(auth);
// Modify user
routes.put('/users', UserController.update);
// List all Providers
routes.get('/providers', ProviderController.index);
// Create Appointment
routes.post('/appointments', AppointmentController.store);
// List Appointments
routes.get('/appointments', AppointmentController.index);
// List Appointments
routes.get('/schedule', ScheduleController.index);
// Store file
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
