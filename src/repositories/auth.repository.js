const prisma = require('../config/prisma.config');

exports.findUserByEmail = async (email) => {
    return await prisma.user.findUnique({ where: { email } });
};

exports.createUser = async (userData) => {
    return await prisma.user.create({ data: userData });
};