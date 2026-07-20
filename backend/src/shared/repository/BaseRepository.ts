export interface FindAllOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, unknown>;
}

export interface BaseRepository<T, CreateDTO, UpdateDTO = Partial<CreateDTO>> {
  findById(id: string): Promise<T | null>;
  findAll(options?: FindAllOptions): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(id: string): Promise<boolean>;
}
