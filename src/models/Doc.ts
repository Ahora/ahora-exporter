export interface Doc {
    id?: any;
    sourceId: number;
    subject: string;
    description?: string;
    organizationId: number;
    assigneeUserId?: number;
    reporterUserId?: number;
    commentsNumber: number;
    docTypeId: number;
    locked: boolean;
    milestoneId?: number;
    metadata?: any;
    statusId?: number;
    labels?: number[];
    createdAt: Date | string;
    closedAt: Date | string | null;
    updatedAt: Date | string;
    docSourceId: number
}
export interface AhoraDoc extends Doc {
    id: number;
    htmlDescription?: string;
    organizationId: number;
}
