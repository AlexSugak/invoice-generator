import { DatabaseService } from '../db.service';
import { Injectable } from '@nestjs/common';
import { BasicInvoiceInfo, DraftsListItem } from '@invoice/common';

export type DraftDetails = {
  userName: string;
  id: number;
  name: string;
  params: object;
};

@Injectable()
export class DraftService {
  constructor(private readonly db: DatabaseService) {}

  async createDraft({
    userName,
    invoiceData,
  }: {
    userName: string;
    invoiceData: BasicInvoiceInfo;
  }): Promise<void> {
    const { draftName, ...params } = invoiceData;
    await this.db.Sql()`
        INSERT INTO user_drafts (userName, name, params, updated_at)
        VALUES (${userName}, ${draftName}, ${JSON.stringify(params)}, now())
    `;
  }

  async editDraft({
    userName,
    draftId,
    invoiceData,
  }: {
    userName: string;
    draftId: number;
    invoiceData: BasicInvoiceInfo;
  }): Promise<void> {
    const { draftName, ...params } = invoiceData;
    await this.db.Sql()`
        UPDATE user_drafts
        SET username = ${userName}, name = ${draftName}, params = ${JSON.stringify(params)}, updated_at = now()
        WHERE id = ${draftId}
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
    draftId,
  }: {
    userName: string;
    draftId: number;
  }): Promise<DraftDetails | null> {
    const res = await this.db.Sql()<Array<{ name: string; params: string }>>`
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
    const res = await this.db.Sql()<Array<{ id: number; name: string }>>`
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
