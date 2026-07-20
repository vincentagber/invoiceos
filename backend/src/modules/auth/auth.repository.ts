import { User } from '@prisma/client';
import { PrismaBaseRepository } from '../../shared/repository';
import { prisma } from '../../shared/lib/prisma';

type CreateUserDTO = {
  email: string;
  password: string;
  name: string;
};

export class AuthRepository extends PrismaBaseRepository<User, CreateUserDTO> {
  protected getModel() {
    return prisma.user;
  }

  async findByEmail(email: string): Promise<(User & { businesses?: unknown[] }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { businesses: true },
    });
  }

  async findByIdWithBusinesses(id: string): Promise<(User & { businesses: unknown[] }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { businesses: true },
    });
  }

  async createWithBusiness(data: CreateUserDTO): Promise<User & { businesses: unknown[] }> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        businesses: {
          create: {
            name: `${data.name}'s Business`,
          },
        },
      },
      include: { businesses: true },
    }) as Promise<User & { businesses: unknown[] }>;
  }
}

export const authRepository = new AuthRepository();
