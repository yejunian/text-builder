export type UpsertionTimestamps = {
  createdAt: string;
  updatedAt: string;
};

export type DeletionTimestamp = {
  deletedAt: string;
};

export type CrudTimestamp = UpsertionTimestamps & Partial<DeletionTimestamp>;
