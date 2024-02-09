import express from 'express';
import { Schedule } from '../models/schedule';

const router = express.Router();


router.post('/schedule/add', async (req, res) => {
    try {
        const { date, time, event, userId } = req.body;
        
        const schedule = new Schedule({
            date,
            time,
            event,
            userId
        });
        await schedule.save();

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;
