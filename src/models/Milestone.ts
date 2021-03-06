export interface AhoraMilestoneForUpdate {
    id?: number;
    title: string;
    description: string;
    organizationId: number;
    createdAt: Date;
    updatedAt: Date;
    sourceId: number;
    closedAt?: Date;
    dueOn?: Date;
    state: string;
}

export default interface AhoraMilestone extends AhoraMilestoneForUpdate{
    milestoneId: number;
}
