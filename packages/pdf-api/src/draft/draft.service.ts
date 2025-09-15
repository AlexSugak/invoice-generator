import { Injectable } from '@nestjs/common';
import sql from '../db';

export type DraftDetails = {
  userName: string;
  name: string;
  params: object;
};

@Injectable()
export class DraftService {
  async saveDraft({
    userName,
    draftName,
    params,
  }: {
    userName: string;
    draftName: string;
    params: object;
  }): Promise<void> {
    await sql`
        INSERT INTO user_drafts (userName, name, params, updated_at)
        VALUES (${userName}, ${draftName}, ${JSON.stringify(params)}, now())
        ON CONFLICT (userName, name) DO UPDATE
        SET params = EXCLUDED.params
    `;
  }

  async getDraft({
    userName,
    draftName,
  }: {
    userName: string;
    draftName: string;
  }): Promise<DraftDetails | null> {
    const res = await sql<Array<{ params: string }>>`
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

  async getDraftList({
    userName,
  }: {
    userName: string;
  }): Promise<DraftDetails[] | null> {
    const res = await sql<Array<{ name: string; params: string }>>`
        SELECT name, params
        FROM user_drafts
        WHERE userName = ${userName}
        ORDER BY updated_at DESC
    `;

    if (!res) {
      return null;
    }

    if (res.length === 0) {
      return [];
    }

    return res.map((row) => ({
      userName,
      name: row.name,
      params: JSON.parse(row.params) as object,
    }));
  }

  async deleteDraft({
    userName,
    draftName,
  }: {
    userName: string;
    draftName: string;
  }): Promise<boolean> {
    const res = await sql`
        DELETE FROM user_drafts
        WHERE userName = ${userName}
        AND name = ${draftName}
    `;

    return res.count > 0;
  }

  async renameDraft({
    userName,
    oldName,
    newName,
  }: {
    userName: string;
    oldName: string;
    newName: string;
  }): Promise<boolean> {
    const res = await sql`
        UPDATE user_drafts
        SET name = ${newName}, updated_at = now()
        WHERE userName = ${userName}
        AND name = ${oldName}
    `;

    return res.count > 0;
  }
}
