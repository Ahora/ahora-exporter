export default interface AhoraMilestone {
    id?: number;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    sourceId: number;
    closedAt?: Date;
    dueOn?: Date;
    state: "open" | "closed";
}