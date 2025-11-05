const prisma = require('../config/prisma.config');

exports.createReport = async (reportData) => {
    return await prisma.report.create({ data: reportData });
};