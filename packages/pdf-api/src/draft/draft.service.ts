import { Injectable } from '@nestjs/common';
import sql from '../db';
import { DraftsListItem, Invoice } from '@invoice/common';

export type DraftDetails = {
  userName: string;
  id: number;
  name: string;
  params: object;
};

@Injectable()
export class DraftService {
  async createDraft({
    userName,
    invoiceData,
  }: {
    userName: string;
    invoiceData: Invoice;
  }): Promise<void> {
    const { invoiceName, ...params } = invoiceData;
    await sql`
        INSERT INTO user_drafts (userName, name, params, updated_at)
        VALUES (${userName}, ${invoiceName}, ${JSON.stringify(params)}, now())
    `;
  }

  async editDraft({
    userName,
    draftId,
    invoiceData,
  }: {
    userName: string;
    draftId: number;
    invoiceData: Invoice;
  }): Promise<void> {
    const { invoiceName, ...params } = invoiceData;
    await sql`
        UPDATE user_drafts
        SET username = ${userName}, name = ${invoiceName}, params = ${JSON.stringify(params)}, updated_at = now()
        WHERE id = ${draftId}
    `;
  }

  async getDraft({
    userName,
    draftId,
  }: {
    userName: string;
    draftId: number;
  }): Promise<DraftDetails | null> {
    const res = await sql<Array<{ name: string; params: string }>>`
        SELECT name, params 
        FROM user_drafts 
        WHERE userName = ${userName} 
        AND id = ${draftId} 
    `;

    if (!res || res.length === 0) {
      return null;
    }

    const [{ name, params }] = res;

    return {
      userName,
      id: draftId,
      name,
      params: JSON.parse(params) as object,
    };
  }

  async getDrafts(userName: string): Promise<DraftsListItem[]> {
    const res = await sql<Array<{ id: number; name: string }>>`
        SELECT id, name 
        FROM user_drafts 
        WHERE userName = ${userName} 
    `;

    return (res || []).map(({ id, name }) => ({
      id,
      // Using id as fallback in case of empty name
      name: name || `Draft ${id}`,
    }));
  }
}
