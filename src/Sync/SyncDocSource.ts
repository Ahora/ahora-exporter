import SyncEntityService from "./SyncEntityService";
import { AhoraDocSource } from "../docsources";
import GithubSyncLabelsService, { GitHubLabel } from "../GithubSync/GithubSyncLabelsService";
import GithubSyncMilestoneService, { GitHubMilestone } from "../GithubSync/GithubSyncMilestonesService";
import AhoraMilestone, { AhoraMilestoneForUpdate } from "../models/Milestone";
import { Doc } from "../models/Doc";
import GithubSyncIssuesService, { GithubIssue } from "../GithubSync/GithubSyncIssuesService";
import OrganizationData from "../organizationData";
import { AhoraDocSourceLabel, AhoraDocSourceLabelForUpdate } from "../models/DocSourceLabel";

export default class SyncDocSource {
    public readonly labelsService: SyncEntityService<AhoraDocSourceLabel, GitHubLabel, AhoraDocSourceLabelForUpdate>;
    public readonly milestonesService: SyncEntityService<AhoraMilestone, GitHubMilestone, AhoraMilestoneForUpdate>;
    public readonly issuesService: SyncEntityService<Doc, GithubIssue>;

    constructor(public readonly organizationData: OrganizationData, public readonly docSource: AhoraDocSource) {
        this.labelsService = new GithubSyncLabelsService(organizationData, docSource);
        this.milestonesService = new GithubSyncMilestoneService(organizationData, docSource);
        this.issuesService = new GithubSyncIssuesService(organizationData, this);
    }

    async loadData() {
        await this.labelsService.load();
        await this.milestonesService.load();
    }

    async sync() {
        // The order is very important!
        // Update issue to the end
        //console.log(`sync milestones ${this.docSource.organization}/${this.docSource.repo}`);
        //await this.milestonesService.sync();
        //console.log(`sync labels ${this.docSource.organization}/${this.docSource.repo}`);
        //await this.labelsService.sync();
        console.log(`sync issues ${this.docSource.organization}/${this.docSource.repo}`);
        await this.issuesService.sync();
    }
}