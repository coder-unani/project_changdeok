import { IServiceResponse } from "../types/response";
import { IContentGroup, IContent, IContentService } from "../types/content";

export class ContentService implements IContentService {
  async create(data: IContent): Promise<void> {
    console.log('create content');
  }

  async read(contentId: number): Promise<IServiceResponse<IContent>> {
    console.log('read content');

    return {
      result: true,
    }
  }

  async modify(data: IContent): Promise<void> {
    console.log('modify content');
  }

  async delete(contentId: number): Promise<void> {
    console.log('delete content');
  }

  async list(groupId: number, page: number): Promise<IServiceResponse<IContent[]>> {
    console.log('list content');

    return {
      result: true,
      data: []
    }
  }

  async groupInfo(groupId: number): Promise<IServiceResponse<IContentGroup>> {
    console.log('groupInfo content');

    return {
      result: true,
    }
  }
}