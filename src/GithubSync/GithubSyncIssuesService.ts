import GithubBaseSyncService from "./GithubBaseSyncService";
import { GithubUser, AhoraUser, addUserFromGithubUser } from "../users";
import { GitHubLabel } from "./GithubSyncLabelsService";
import { Doc } from "../models/Doc";
import { AhoraDocStatus } from "../stratuses";
import { ISSUE, PULL_REQUEST } from "../docTypes";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";
import { GitHubMilestone } from "./GithubSyncMilestonesService";
import AhoraMilestone from "../models/Milestone";
import { AhoraDocSourceLabel } from "../models/DocSourceLabel";


export interface GithubIssue {
    title: string;
    body: string;
    state: string;
    number: number;
    milestone?: GitHubMilestone;
    assignee: GithubUser | null,
    comments: number;
    id: any;
    user: GithubUser;
    labels: GitHubLabel[];
    locked: boolean;
    closed_at: string | null;
    created_at: string;
    updated_at: string;
    pull_request?: any;
}


export default class GithubSyncIssuesService extends GithubBaseSyncService<Doc, GithubIssue> {

    constructor(organizationData: OrganizationData, private syncDocSource: SyncDocSource) {
        super(organizationData, syncDocSource.docSource, "issues", "issues");
    }

    protected getQuery(): any {
        return {
            state: this.docSource.lastUpdated? "all": "open",
            per_page: 100,
            since: this.docSource.lastUpdated
        };
    }


    protected async converSourceToDist(source: GithubIssue): Promise<Doc> {
        let docType = this.organizationData.docTypesMap.get(source.pull_request ? PULL_REQUEST: ISSUE);
        const doc: Doc = {
            docSourceId: this.docSource.id!,
            sourceId: source.number,
            subject: source.title,
            description: source.body,
            closedAt: source.closed_at,
            commentsNumber: source.comments,
            docTypeId: docType!.id,
            createdAt: source.created_at,
            updatedAt: source.updated_at,
        }

        if(source.assignee) {
            const ahoraAssignee: AhoraUser = await addUserFromGithubUser(source.assignee);
            doc.assigneeUserId = ahoraAssignee.id
        }

        if(source.user) {
            const ahoraReporter: AhoraUser = await addUserFromGithubUser(source.user);
            doc.reporterUserId = ahoraReporter.id;
        }

        if(source.state) {
            const status: AhoraDocStatus | undefined =  this.organizationData.statusesMap.get(source.state);
            if(status) {
                doc.statusId =  status.id;
            }
        }

        if(source.milestone) {
            const milestone: AhoraMilestone =  await this.syncDocSource.milestonesService.upsert(source.milestone);
            if(milestone) {
                doc.milestoneId =  milestone.milestoneId;
            }
        }

        if(source.labels) {
            const values: AhoraDocSourceLabel[] = await Promise.all(source.labels.map(async (gitHubLabel) => await this.syncDocSource.labelsService.upsert(gitHubLabel)));
            doc.labels = values.map((labelSource) => labelSource.labelId);
        }

        return doc;
    }
}