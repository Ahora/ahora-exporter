import SyncEntityService from "./SyncEntityService";
import { AhoraDocSource } from "../docsources";
import GithubSyncLabelsService, { GitHubLabel } from "../GithubSync/GithubSyncLabelsService";
import GithubSyncMilestoneService, { GitHubMilestone } from "../GithubSync/GithubSyncMilestonesService";
import AhoraMilestone, { AhoraMilestoneForUpdate } from "../models/Milestone";
import { Doc } from "../models/Doc";
import GithubSyncIssuesService, { GithubIssue } from "../GithubSync/GithubSyncIssuesService";
import OrganizationData from "../organizationData";
import { AhoraDocSourceLabel, AhoraDocSourceLabelForUpdate } from "../models/DocSourceLabel";
import GithubSyncPullsService, { AhoraPullRequest, GithubPull } from "../GithubSync/GithubSyncPullsService";

export default class SyncDocSource {
    public readonly labelsService: SyncEntityService<AhoraDocSourceLabel, GitHubLabel, AhoraDocSourceLabelForUpdate>;
    public readonly milestonesService: SyncEntityService<AhoraMilestone, GitHubMilestone, AhoraMilestoneForUpdate>;
    public readonly issuesService: SyncEntityService<Doc, GithubIssue>;
    public readonly pullsService: SyncEntityService<AhoraPullRequest, GithubPull>;

    constructor(public readonly organizationData: OrganizationData, public readonly docSource: AhoraDocSource) {
        this.labelsService = new GithubSyncLabelsService(organizationData, docSource);
        this.milestonesService = new GithubSyncMilestoneService(organizationData, docSource);
        this.issuesService = new GithubSyncIssuesService(organizationData, this);
        this.pullsService = new GithubSyncPullsService(organizationData, this);
    }

    async loadData() {
        await this.labelsService.load();
        await this.milestonesService.load();
    }

    async sync() {
        await this.issuesService.sync();
        await this.pullsService.sync();
    }
}