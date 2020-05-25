import { AhoraDocSource } from "../docsources";
import GithubBaseSyncService from "./GithubBaseSyncService";
import AhoraMilestone from "../models/Milestone";
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
    state: "open" | "closed";
}

export default class GithubSyncMilestoneService extends GithubBaseSyncService<AhoraMilestone, GitHubMilestone> {

    constructor(organizationData: OrganizationData, docSource: AhoraDocSource) {
        super(organizationData, docSource, "milestones", "milestones");
    }

    protected converSourceToDist(source: GitHubMilestone): Promise<AhoraMilestone> {
        const milestone: AhoraMilestone = {
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