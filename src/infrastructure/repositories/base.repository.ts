import { IBaseRepository } from "@common/types/repository.types.js";

export interface PrismaDelegate<T, CreateDTO, UpdateDTO> {
  findUnique(args: { where: { id: any } }): Promise<T | null>;
  create(args: { data: CreateDTO }): Promise<T>;
  update(args: { where: { id: any }; data: UpdateDTO }): Promise<T>;
  delete(args: { where: { id: any } }): Promise<T>;
}

export abstract class BaseRepository<T, CreateDTO, UpdateDTO, E> implements IBaseRepository<
  E,
  CreateDTO,
  UpdateDTO
> {
  constructor(
    protected readonly delegate: PrismaDelegate<T, CreateDTO, UpdateDTO>,
    protected readonly mapToEntity: (item: T) => E,
  ) {}

  async findById(id: string | number): Promise<E | null> {
    const result = await this.delegate.findUnique({ where: { id } });
    return result ? this.mapToEntity(result) : null;
  }

  async create(data: CreateDTO): Promise<E> {
    const result = await this.delegate.create({ data });
    return this.mapToEntity(result);
  }

  async update(id: string | number, data: UpdateDTO): Promise<E> {
    const result = await this.delegate.update({ where: { id }, data });
    // return this.mapper(result); // Fixed logic context
    return this.mapToEntity(result);
  }

  async delete(id: string | number): Promise<E> {
    const result = await this.delegate.delete({ where: { id } });
    return this.mapToEntity(result);
  }
}
