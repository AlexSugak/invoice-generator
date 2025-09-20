import { DatabaseService } from '../db.service';
import { Injectable } from '@nestjs/common';

export type DraftDetails = {
  userName: string;
  name: string;
  params: object;
};

@Injectable()
export class DraftService {
  constructor(private readonly db: DatabaseService) {}

  async saveDraft({
    userName,
    draftName,
    params,
  }: {
    userName: string;
    draftName: string;
    params: object;
  }): Promise<void> {
    await this.db.Sql()`
        INSERT INTO user_drafts (userName, name, params, updated_at)
        VALUES (${userName}, ${draftName}, ${JSON.stringify(params)}, now())
        ON CONFLICT (userName, name) DO UPDATE
        SET params = EXCLUDED.params
    `;
  }

  async deleteDraft({
    userName,
    draftName,
  }: {
    userName: string;
    draftName: string;
  }): Promise<void> {
    await this.db.Sql()`
        DELETE FROM user_drafts where userName = ${userName} and name = ${draftName};
    `;
  }

  async getDraft({
    userName,
    draftName,
  }: {
    userName: string;
    draftName: string;
  }): Promise<DraftDetails | null> {
    const res = await this.db.Sql()<Array<{ params: string }>>`
        SELECT params 
        FROM user_drafts 
        WHERE userName = ${userName} 
        AND name = ${draftName} 
    `;

    if (!res || res.length === 0) {
      return null;
    }

    const [{ params }] = res;

    return { userName, name: draftName, params: JSON.parse(params) as object };
  }

  async getDrafts(userName: string): Promise<DraftDetails[]> {
    const res = await sql<
      Array<{ userName: string; name: string; params: string }>
    >`
        SELECT name, params 
        FROM user_drafts 
        WHERE userName = ${userName}
    `;

    if (!res || res.length === 0) {
      return [];
    }

    return res.map(({ name, params }) => ({
      userName,
      name,
      params: JSON.parse(params) as object,
    }));
  }

  async deleteDraft({
    userName,
    draftName,
  }: {
    userName: string;
    draftName: string;
  }): Promise<void> {
    await sql`
        DELETE FROM user_drafts 
        WHERE userName = ${userName} 
        AND name = ${draftName} 
    `;
  }
}
