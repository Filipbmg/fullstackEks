import { Router } from 'express';
import bcrypt from 'bcrypt';
import { connect } from '../database/connection.js';
import { sanitizeEmail } from '../util/sanitize.js';

const router = Router();

router.post('/signup', async (req, res) => {
    const email = sanitizeEmail(req.body.email);
    const { password } = req.body;
    if ( !email || !password ) {
        return res.status(400).send({ error: 'Missing field(s)' });
    }
    else {
        try {
            const db = await connect();
            const userQuery = await db.collection("users").findOne({ email });
            if (userQuery) {
                return res.status(409).send({ error: 'Email is already in use' });
            }
            else {
                const hash = await bcrypt.hash(password, 12);
                const result = await db.collection("users").insertOne({ email, password: hash });

                if (result.insertedId) {
                    return res.status(201).send({ message: 'User created successfully'});
                } else {
                    return res.status(500).send({ message: 'User creation failed'})
                }
            }
        } catch (error) {
            console.error('Database error: ', error);
            res.status(500).send({ error: 'Database error' });
        }
    }
});

export default router;