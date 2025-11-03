import { prisma } from '../config/database';
import { Prisma, User, UserRole } from '@prisma/client';

export class UserRepository {
  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({ data });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Find all users with pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, where, orderBy } = params;
    return await prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * Count users
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return await prisma.user.count({ where });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}

export default new UserRepository();