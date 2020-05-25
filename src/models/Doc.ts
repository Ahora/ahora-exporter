export interface Doc {
    id?: any;
    docId?: number;
    subject: string;
    description?: string;
    assigneeUserId?: number;
    reporterUserId?: number;
    commentsNumber: number;
    docTypeId: number;
    milestoneId?: number;
    metadata?: any;
    statusId?: number;
    labels?: number[];
    createdAt: Date | string;
    closedAt: Date | string | null;
    updatedAt: Date | string;
    sourceId: number
}
export interface AhoraDoc extends Doc {
    id: number;
    htmlDescription?: string;
    organizationId: number;
}
