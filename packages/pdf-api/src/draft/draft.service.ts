import { DatabaseService } from '@/db.service';
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
                                          SET params = EXCLUDED.params,
                                          updated_at = now()
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
      WHERE userName = ${userName} AND name = ${draftName}
    `;

    if (!res || res.length === 0) return null;

    return {
      userName,
      name: draftName,
      params: JSON.parse(res[0].params) as object,
    };
  }

  async getDraftsByUser(userName: string): Promise<DraftDetails[]> {
    const res = await this.db.Sql()<
      Array<{ name: string; params: string; updated_at: string }>
    >`
        SELECT name, params, updated_at
        FROM user_drafts
        WHERE userName = ${userName}
        ORDER BY updated_at DESC
    `;

    return res.map((row) => ({
      userName,
      name: row.name,
      params: JSON.parse(row.params) as object,
      updatedAt: row.updated_at,
    }));
  }
}
