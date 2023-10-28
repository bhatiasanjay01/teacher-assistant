export interface EmptyRequest {}

export interface ByIdRequest {
  id: string;
}

export interface ByIdListRequest {
  workspaceId: string;
  idList: string[];
}

export interface GetByUniversalIdRequest {
  universalId: string;
}

export interface GetBySpaceIdRequest {
  spaceId: string;
}

export interface GetByUserAndSpaceIdRequest {
  userId: string;
  spaceId: string;
}

export interface GetByEmailRequest {
  email: string;
}

export interface SuccessResponse {
  isSuccess: boolean;
  errCode?: string;
  errMessage?: string;
}

export interface CountResponse {
  count: number;
}
