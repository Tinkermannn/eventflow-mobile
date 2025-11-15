"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserVoteInPoll = exports.deletePoll = exports.getPollWithVoteStats = exports.deletePollVote = exports.getPollOptionsWithVotes = exports.getEventPolls = exports.submitPollVote = exports.createPoll = void 0;
/**
 * File: pollRepository.ts
 * Author: eventFlow Team
 * Deskripsi: Repository untuk operasi database Poll, PollOption, dan PollVote dengan optimized counting.
 * Dibuat: 2025-11-11
 * Versi: 2.0.0
 * Lisensi: MIT
 * Dependensi: Prisma
*/
const prisma_1 = require("../config/prisma");
const createPoll = async (data) => {
    return await prisma_1.prisma.poll.create({
        data: {
            eventId: data.eventId,
            question: data.question,
            options: {
                create: data.options.map(text => ({ text })),
            },
        },
        include: {
            options: {
                include: {
                    _count: {
                        select: { pollVotes: true }
                    }
                }
            }
        },
    });
};
exports.createPoll = createPoll;
const submitPollVote = async (data) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Delete existing vote from user in the same poll
        const pollOption = await tx.pollOption.findUnique({
            where: { id: data.pollOptionId },
            include: { poll: true }
        });
        if (!pollOption) {
            throw new Error('Poll option not found');
        }
        // Delete any existing votes by this user in the same poll
        await tx.pollVote.deleteMany({
            where: {
                userId: data.userId,
                pollOption: {
                    pollId: pollOption.pollId
                }
            }
        });
        // Create new vote
        const vote = await tx.pollVote.create({
            data,
            include: {
                pollOption: {
                    include: {
                        _count: {
                            select: { pollVotes: true }
                        }
                    }
                }
            }
        });
        // Get updated options with vote counts
        const updatedOptions = await tx.pollOption.findMany({
            where: { pollId: pollOption.pollId },
            include: {
                _count: {
                    select: { pollVotes: true }
                },
                pollVotes: {
                    where: { userId: data.userId },
                    select: { userId: true }
                }
            }
        });
        // Transform data to include votes count
        const transformedOptions = updatedOptions.map(option => ({
            ...option,
            votes: option._count.pollVotes,
            userVoted: option.pollVotes.length > 0
        }));
        return { vote, updatedOptions: transformedOptions };
    });
};
exports.submitPollVote = submitPollVote;
const getEventPolls = async (eventId) => {
    return await prisma_1.prisma.poll.findMany({
        where: { eventId },
        include: {
            options: {
                include: {
                    _count: {
                        select: { pollVotes: true }
                    }
                }
            }
        },
    });
};
exports.getEventPolls = getEventPolls;
const getPollOptionsWithVotes = async (pollId, userId) => {
    const options = await prisma_1.prisma.pollOption.findMany({
        where: { pollId },
        include: {
            _count: {
                select: { pollVotes: true }
            },
            ...(userId ? {
                pollVotes: {
                    where: { userId },
                    select: { userId: true }
                }
            } : {})
        },
    });
    return options.map(option => ({
        ...option,
        votes: option._count.pollVotes,
        userVoted: userId ? option.pollVotes.length > 0 : undefined
    }));
};
exports.getPollOptionsWithVotes = getPollOptionsWithVotes;
const deletePollVote = async (pollId, userId) => {
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Delete all votes by this user in the poll
        const deletedVotes = await tx.pollVote.deleteMany({
            where: {
                userId: userId,
                pollOption: {
                    pollId: pollId
                }
            }
        });
        // Get updated options with vote counts
        const updatedOptions = await tx.pollOption.findMany({
            where: { pollId },
            include: {
                _count: {
                    select: { pollVotes: true }
                }
            }
        });
        const transformedOptions = updatedOptions.map(option => ({
            ...option,
            votes: option._count.pollVotes,
            userVoted: false
        }));
        return { deletedCount: deletedVotes.count, updatedOptions: transformedOptions };
    });
};
exports.deletePollVote = deletePollVote;
const getPollWithVoteStats = async (pollId, userId) => {
    const poll = await prisma_1.prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            options: {
                include: {
                    _count: {
                        select: { pollVotes: true }
                    },
                    ...(userId ? {
                        pollVotes: {
                            where: { userId },
                            select: { userId: true }
                        }
                    } : {})
                }
            },
            _count: {
                select: {
                    options: true
                }
            }
        }
    });
    if (!poll)
        return null;
    const totalVotes = poll.options.reduce((sum, option) => sum + option._count.pollVotes, 0);
    const enhancedOptions = poll.options.map(option => ({
        ...option,
        votes: option._count.pollVotes,
        percentage: totalVotes > 0 ? Math.round((option._count.pollVotes / totalVotes) * 100) : 0,
        userVoted: userId ? option.pollVotes.length > 0 : undefined
    }));
    return {
        ...poll,
        options: enhancedOptions,
        totalVotes,
        userHasVoted: userId ? enhancedOptions.some(option => option.userVoted) : undefined
    };
};
exports.getPollWithVoteStats = getPollWithVoteStats;
const deletePoll = async (pollId) => {
    return await prisma_1.prisma.poll.delete({
        where: { id: pollId },
    });
};
exports.deletePoll = deletePoll;
const getUserVoteInPoll = async (pollId, userId) => {
    return await prisma_1.prisma.pollVote.findFirst({
        where: {
            userId: userId,
            pollOption: {
                pollId: pollId
            }
        },
        include: {
            pollOption: true
        }
    });
};
exports.getUserVoteInPoll = getUserVoteInPoll;
