import { BaseRepository, FindAllOptions } from './BaseRepository';
import prisma from '../../lib/prisma';

type PrismaDelegate = {
  findUnique: (args: any) => any;
  findMany: (args?: any) => any;
  create: (args: any) => any;
  update: (args: any) => any;
  delete: (args: any) => any;
  count: (args?: any) => any;
};

export abstract class PrismaBaseRepository<T, CreateDTO, UpdateDTO = Partial<CreateDTO>>
  implements BaseRepository<T, CreateDTO, UpdateDTO>
{
  protected abstract getModel(): PrismaDelegate;

  async findById(id: string): Promise<T | null> {
    return this.getModel().findUnique({ where: { id } }) as Promise<T | null>;
  }

  async findAll(options?: FindAllOptions): Promise<T[]> {
    return this.getModel().findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
    }) as Promise<T[]>;
  }

  async create(data: CreateDTO): Promise<T> {
    return this.getModel().create({ data }) as Promise<T>;
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    return this.getModel().update({ where: { id }, data }) as Promise<T>;
  }

  async delete(id: string): Promise<void> {
    await this.getModel().delete({ where: { id } });
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.getModel().count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }
}
