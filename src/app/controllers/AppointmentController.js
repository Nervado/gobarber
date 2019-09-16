import * as Yup from 'yup';
import { subHours, startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Appointment from '../models/Appointment';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const apppointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(apppointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }
    const { provider_id, date } = req.body;
    // check if selected provider is diferent for logged user
    const isEqual = req.userId === provider_id;

    if (isEqual) {
      return res
        .status(401)
        .json({ error: 'You can not create a appointment for yourself' });
    }

    // check if provider is a valid provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments whith providers' });
    }
    // validations
    const hourStart = startOfHour(parseISO(date));
    // check if dates is valid
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // check if date is avaliable
    const checkAvailability = await await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    /**
     * Notify provider
     */
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json({ appointment });
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You dont have permission to cancel this apointement',
      });
    }

    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel apointments 2 hours in advance',
      });
    }
    appointment.canceled_at = new Date();
    await appointment.save();
    // console.log(CancellationMail.key);
    await Queue.add(CancellationMail.key, { appointment });

    return res.json(appointment);
  }
}

export default new AppointmentController();
