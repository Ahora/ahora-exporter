export interface Comment {
    id?: any;
    comment: string;
    sourceId: number;
    authorUserId?: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    githubIssueId: number
}

export interface AhoraDoc extends Comment {
    id: number;
    organizationId: number;
}
