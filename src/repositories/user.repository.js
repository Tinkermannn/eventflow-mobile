const prisma = require('../config/prisma.config');

exports.findUserById = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        // Pilih field yang ingin dikembalikan, jangan kirim passwordHash
        select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
        }
    });
};

exports.updateUser = async (userId, dataToUpdate) => {
    return await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
            phoneNumber: true,
            role: true,
        }
    });
};