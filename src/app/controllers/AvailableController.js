import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }
    const searchDate = Number(date);

    const appointment = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const hourStartService = 8; // 24 hours
    const numberOfAvailableHours = 14;
    const schedule = [...new Array(numberOfAvailableHours)].map((_, i) => {
      const hours = hourStartService + i;
      return `${hours < 10 ? 0 : ''}${hours}:00`;
    });

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );
      return {
        time,
        value: format(value, `yyy-MM-dd'T'HH:mm:ssxxx`),
        available:
          isAfter(value, new Date()) &&
          !appointment.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(available);
  }
}

export default new AvailableController();
