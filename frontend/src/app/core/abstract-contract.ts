export interface AbstractBackend {
  id: string;
  version: string;

  lastModifiedById?: string;
  lastModifiedTimeStr?: string;

  createdById?: string;
  createdTimeStr?: string;

  errorType?: string;

  zippedData?: any; // Buffer -> in backend.
}

export enum AbstractBackendFieldName {
  'lastModifiedById',
  'lastModifiedTimeStr',
  'createdById',
  'createdTimeStr',
}

export interface ModifiedBackendItems {
  addedAllBackendItems: AbstractBackend[];
  updatedAllBackendItems: AbstractBackend[];
  deletedAllBackendItemIds: string[];
}

export interface ResourceNameAndModifiedAllBackendItems {
  resourceName: string;
  modifiedAllItems: ModifiedBackendItems;
}

type ContractSyncPulseItem = {
  resourceName: string;
  addedItems?: AbstractBackend[];
  updatedItems?: AbstractBackend[];
  deletedIds?: string[];
};
export class ContractSyncPulse {
  public static of(
    items: ContractSyncPulseItem[]
  ): ResourceNameAndModifiedAllBackendItems[] {
    return items.map((item) => ({
      resourceName: item.resourceName,
      modifiedAllItems: {
        addedAllBackendItems: item.addedItems || [],
        updatedAllBackendItems: item.updatedItems || [],
        deletedAllBackendItemIds: item.deletedIds || [],
      },
    }));
  }
}
