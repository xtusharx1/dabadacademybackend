const express = require("express");
const router = express.Router();
const TeacherReport = require("../models/teacherReport");

// ✅ Create a new teacher report
router.post("/", async (req, res) => {
    try {
        const report = await TeacherReport.create(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get all reports (with filters)
router.get("/", async (req, res) => {
    try {
        const { subject_id, startDate, endDate } = req.query;
        let where = { is_deleted: false };

        if (subject_id) where.subject_id = subject_id;
        if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

        const reports = await TeacherReport.findAll({ where });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get a single report by ID
router.get("/:id", async (req, res) => {
    try {
        const report = await TeacherReport.findByPk(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get reports by batch and subject
router.get("/batch/:batch_id/subject/:subject_id", async (req, res) => {
    try {
        const { batch_id, subject_id } = req.params;

        const reports = await TeacherReport.findAll({
            where: {
                batch_id,
                subject_id,
                is_deleted: false,
            },
        });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update a report
router.put("/:id", async (req, res) => {
    try {
        const report = await TeacherReport.findByPk(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        await report.update(req.body);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Soft delete a report
router.delete("/:id", async (req, res) => {
    try {
        const report = await TeacherReport.findByPk(req.params.id);
        if (!report) return res.status(404).json({ message: "Report not found" });

        await report.update({ is_deleted: true });
        res.json({ message: "Report soft deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
