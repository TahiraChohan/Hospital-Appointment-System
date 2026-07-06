const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

/* ===========================
   DATABASE CONNECTION
=========================== */

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management',
    waitForConnections: true,
    connectionLimit: 10
});

console.log("✅ MySQL Connected");

/* ===========================
   DASHBOARD STATS
=========================== */

app.get('/api/stats', (req, res) => {

    const stats = {};

    db.query(
        'SELECT COUNT(*) total FROM doctors',
        (err, doctors) => {

            if (err) return res.status(500).json(err);

            stats.doctors = doctors[0].total;

            db.query(
                'SELECT COUNT(*) total FROM patients',
                (err, patients) => {

                    if (err) return res.status(500).json(err);

                    stats.patients = patients[0].total;

                    db.query(
                        'SELECT COUNT(*) total FROM appointments',
                        (err, apps) => {

                            if (err) return res.status(500).json(err);

                            stats.appointments = apps[0].total;

                            db.query(
                                `
                                SELECT
                                SUM(status='Pending') pending,
                                SUM(status='Completed') completed,
                                SUM(status='Cancelled') cancelled
                                FROM appointments
                                `,
                                (err, result) => {

                                    if (err)
                                        return res.status(500).json(err);

                                    stats.pending =
                                        result[0].pending || 0;

                                    stats.completed =
                                        result[0].completed || 0;

                                    stats.cancelled =
                                        result[0].cancelled || 0;

                                    res.json(stats);
                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

/* ===========================
   DOCTORS
=========================== */

// GET ALL DOCTORS

app.get('/api/doctors', (req, res) => {

    db.query(
        'SELECT * FROM doctors ORDER BY id DESC',
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json(result);

        }
    );

});

// ADD DOCTOR

app.post('/api/doctors', (req, res) => {

    const {
        name,
        specialty,
        phone,
        experience,
        image
    } = req.body;

    const sql = `
        INSERT INTO doctors
        (
            name,
            specialty,
            phone,
            experience,
            image
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            specialty,
            phone,
            experience,
            image
        ],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Doctor Added'
            });

        }
    );

});

// UPDATE DOCTOR

app.put('/api/doctors/:id', (req, res) => {

    const {
        name,
        specialty,
        phone,
        experience,
        image
    } = req.body;

    const sql = `
        UPDATE doctors
        SET
        name=?,
        specialty=?,
        phone=?,
        experience=?,
        image=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            specialty,
            phone,
            experience,
            image,
            req.params.id
        ],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Doctor Updated'
            });

        }
    );

});

// DELETE DOCTOR

app.delete('/api/doctors/:id', (req, res) => {

    db.query(
        'DELETE FROM doctors WHERE id=?',
        [req.params.id],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Doctor Deleted'
            });

        }
    );

});

/* ===========================
   PATIENTS
=========================== */

// GET PATIENTS

app.get('/api/patients', (req, res) => {

    db.query(
        'SELECT * FROM patients ORDER BY id DESC',
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json(result);

        }
    );

});

// ADD PATIENT

app.post('/api/patients', (req, res) => {

    const {
        name,
        age,
        gender,
        phone,
        address
    } = req.body;

    const sql = `
        INSERT INTO patients
        (
            name,
            age,
            gender,
            phone,
            address
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            age,
            gender,
            phone,
            address
        ],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Patient Added'
            });

        }
    );

});

// UPDATE PATIENT

app.put('/api/patients/:id', (req, res) => {

    const {
        name,
        age,
        gender,
        phone,
        address
    } = req.body;

    const sql = `
        UPDATE patients
        SET
        name=?,
        age=?,
        gender=?,
        phone=?,
        address=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            name,
            age,
            gender,
            phone,
            address,
            req.params.id
        ],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Patient Updated'
            });

        }
    );

});

// DELETE PATIENT

app.delete('/api/patients/:id', (req, res) => {

    db.query(
        'DELETE FROM patients WHERE id=?',
        [req.params.id],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Patient Deleted'
            });

        }
    );

});

/* ===========================
   APPOINTMENTS
=========================== */

// GET APPOINTMENTS

app.get('/api/appointments', (req, res) => {

    const sql = `
        SELECT
        a.*,
        d.name AS doctor_name,
        d.specialty
        FROM appointments a
        JOIN doctors d
        ON a.doctor_id = d.id
        ORDER BY a.created_at DESC
    `;

    db.query(
        sql,
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            res.json(result);

        }
    );

});

// ADD APPOINTMENT

app.post('/api/appointments', (req, res) => {

    const {
        patient_name,
        doctor_id,
        appointment_date,
        appointment_time
    } = req.body;

    const sql = `
        INSERT INTO appointments
        (
            patient_name,
            doctor_id,
            appointment_date,
            appointment_time,
            status
        )
        VALUES
        (?, ?, ?, ?, 'Pending')
    `;

    db.query(
        sql,
        [
            patient_name,
            doctor_id,
            appointment_date,
            appointment_time
        ],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Appointment Added'
            });

        }
    );

});

// UPDATE STATUS

app.put('/api/appointments/:id', (req, res) => {

    const { status } = req.body;

    db.query(
        'UPDATE appointments SET status=? WHERE id=?',
        [status, req.params.id],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Status Updated'
            });

        }
    );

});

// DELETE APPOINTMENT

app.delete('/api/appointments/:id', (req, res) => {

    db.query(
        'DELETE FROM appointments WHERE id=?',
        [req.params.id],
        (err) => {

            if (err)
                return res.status(500).json(err);

            res.json({
                success: true,
                message: 'Appointment Deleted'
            });

        }
    );

});

/* ===========================
   SERVER
=========================== */

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});