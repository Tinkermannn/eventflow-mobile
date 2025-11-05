const prisma = require('../config/prisma.config');

exports.createEvent = async (eventData) => {
    return await prisma.event.create({ data: eventData });
};

exports.findEventByJoinCode = async (joinCode) => {
    return await prisma.event.findUnique({ where: { joinCode } });
};

exports.isUserInEvent = async (userId, eventId) => {
    const participant = await prisma.eventParticipant.findUnique({
        where: { userId_eventId: { userId, eventId } }
    });
    return !!participant; // Return true jika ada, false jika tidak
};

exports.joinEvent = async (userId, eventId) => {
    return await prisma.eventParticipant.create({
        data: {
            userId,
            eventId,
        },
    });
};

exports.findEventsByUser = async (userId) => {
    // Mencari semua event dimana user adalah organizer ATAU seorang partisipan
    return await prisma.event.findMany({
        where: {
            OR: [
                { organizerId: userId },
                { participants: { some: { userId: userId } } },
            ],
        },
        include: {
            // Menghitung jumlah partisipan untuk setiap event
            _count: {
                select: { participants: true },
            },
        },
        orderBy: {
            startTime: 'desc'
        }
    });
};

exports.findEventDetails = async (eventId) => {
    return await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            organizer: { select: { name: true, avatarUrl: true } },
            _count: { select: { participants: true } }
        }
    });
};