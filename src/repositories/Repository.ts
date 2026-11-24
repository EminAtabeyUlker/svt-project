import { QueryResultRow } from "pg";
import { pool } from "../config/database";

// Generic read-only repository: loads rows from one table and turns them into model objects
export class Repository<TRow extends QueryResultRow, TModel> {
  constructor(
    private readonly tableName: string,
    private readonly idColumn: string,
    private readonly toModel: (row: TRow) => TModel,
  ) {}

  async findAll(): Promise<TModel[]> {
    const result = await pool.query<TRow>(`SELECT * FROM ${this.tableName} ORDER BY ${this.idColumn}`);
    return result.rows.map(this.toModel);
  }

  async findById(id: number): Promise<TModel | null> {
    const result = await pool.query<TRow>(`SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = $1`, [id]);
    return result.rows.length > 0 ? this.toModel(result.rows[0]) : null;
  }
}
