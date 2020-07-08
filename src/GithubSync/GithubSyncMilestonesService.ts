import { AhoraDocSource } from "../models/docsources";
import GithubBaseSyncService from "./GithubBaseSyncService";
import AhoraMilestone, { AhoraMilestoneForUpdate } from "../models/Milestone";
import OrganizationData from "../organizationData";

export interface GitHubMilestone{
    id: any;
    title: string;
    description: string;
    created_at: Date,
    updated_at: Date,
    number: number,
    closed_at: Date,
    due_on: Date
    state: string;
}

export default class GithubSyncMilestoneService extends GithubBaseSyncService<AhoraMilestone, GitHubMilestone, AhoraMilestoneForUpdate> {

    constructor(organizationData: OrganizationData, docSource: AhoraDocSource) {
        super(organizationData, docSource, "milestones", "milestones");
    }

    protected getQuery(): any {
        return { state: 'all' };
    }

    protected converSourceToDist(source: GitHubMilestone): Promise<AhoraMilestoneForUpdate> {
        const milestone: AhoraMilestoneForUpdate = {
            closedAt: source.closed_at,
            createdAt: source.created_at,
            description: source.description,
            dueOn: source.due_on,
            sourceId: source.number,
            state: source.state,
            title: source.title,
            updatedAt: source.updated_at
        }
        return Promise.resolve(milestone);
    }
}