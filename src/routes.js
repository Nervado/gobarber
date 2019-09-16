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
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

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
// List available hours
routes.get('/providers/:providerId/available', AvailableController.index);
// Create Appointment
routes.post('/appointments', AppointmentController.store);
// List Appointments
routes.get('/appointments', AppointmentController.index);
// Delete Appointments
routes.delete('/appointments/:id', AppointmentController.delete);
// List Appointments
routes.get('/schedule', ScheduleController.index);
// List Notifications
routes.get('/notifications', NotificationController.index);
// Read Notifications
routes.put('/notifications/:id', NotificationController.update);
// Store file
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
