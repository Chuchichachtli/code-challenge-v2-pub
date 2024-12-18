import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folder } from 'src/entities/folder';
import { TreeRepository } from 'typeorm';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: TreeRepository<Folder>,
  ) {}

  findAll(): Promise<Folder[]> {
    return this.folderRepository.find();
  }

  getChildrenFolderIdsFromTree(
    folder: Folder,
    folderIds: Array<string>,
  ): Array<string> {
    if (folder.children) {
      for (const child of folder.children) {
        this.getChildrenFolderIdsFromTree(child, folderIds);
      }
    }
    folderIds.push(folder.id);

    return folderIds;
  }

  getChildrenFoldersFromTree(
    folder: Folder,
    folders: Array<Folder>,
  ): Array<Folder> {
    if (folder.children) {
      for (const child of folder.children) {
        this.getChildrenFoldersFromTree(child, folders);
      }
    }
    folders.push(folder);

    return folders;
  }

  async getDocumentWithDescendants(folder: Folder): Promise<Folder> {
    const folderTree = await this.folderRepository.findDescendantsTree(folder, {
      relations: ['documents', 'parentFolder'],
    });

    return folderTree;
  }

  /**
   * Written with the assumptuion that there is only one root folder and can not be deleted.
   * @returns Folder tree with all descendants and documents
   */
  async getRootWithDescendants(): Promise<Folder> {
    const allFolders = await this.folderRepository.find({
      relations: ['documents', 'parentFolder'],
    });

    function buildFolderTree(
      folders: Folder[],
      parentId: string | null,
    ): Folder[] {
      return folders
        .filter((folder) =>
          folder.parentFolder
            ? folder.parentFolder.id === parentId
            : parentId === null,
        )
        .map((folder) => ({
          ...folder,
          children: buildFolderTree(folders, folder.id),
        }));
    }

    const tree = buildFolderTree(allFolders, null);
    return tree[0];
  }

  async findOne(id: string): Promise<Folder | null> {
    return await this.folderRepository.findOne({
      where: { id },
      relations: ['documents', 'parentFolder', 'children'],
    });
  }

  async remove(id: string): Promise<void> {
    await this.folderRepository.delete(id);
  }

  async create(data: Folder): Promise<Folder> {
    return await this.folderRepository.save(data);
  }

  async update(data: Folder): Promise<Folder> {
    return await this.folderRepository.save(data);
  }

  async findDescendants(folder: Folder): Promise<Folder[]> {
    return (
      await this.folderRepository.findDescendants(folder, {
        relations: ['documents'],
      })
    ).filter((f) => f.id !== folder.id);
  }

  async findPath(folder: Folder): Promise<String> {
    return await this.folderRepository.findAncestors(folder).then(
      (ancestors) =>
        ancestors
          .reverse()
          .map((ancestor) => ancestor.name)
          .join('/') ?? 'Root',
    );
  }

  async deleteFolder(folder: Folder): Promise<void> {
    const descendants = await this.findDescendants(folder);

    // Delete documents in all descendant folders
    for (const desc of descendants) {
      await this.folderRepository.delete({ id: desc.id });
    }

    // Delete all descendant folders
    await this.folderRepository.remove(descendants);

    // Delete the parent folder
    await this.folderRepository.remove(folder);
  }
}
