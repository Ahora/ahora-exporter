import GithubBaseSyncService from "./GithubBaseSyncService";
import { GithubUser, AhoraUserSource, addUserFromGithubUser } from "../models/users";
import { GitHubLabel } from "./GithubSyncLabelsService";
import { Doc } from "../models/Doc";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";
import { GitHubMilestone } from "./GithubSyncMilestonesService";
import AhoraMilestone from "../models/Milestone";
import { AhoraDocSourceLabel } from "../models/DocSourceLabel";
import { ISSUE_DOCTYPE_ID } from "../models/docTypes";
import GithubSyncCommentsService from "./GithubSyncCommentsService";


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
    closed_at: string | Date | null;
    created_at: string;
    updated_at: string;
    pull_request?: any;
}


export default class GithubSyncIssuesService<TDIST extends Doc = Doc, TSource extends GithubIssue = GithubIssue> extends GithubBaseSyncService<Doc, TSource> {

    constructor(organizationData: OrganizationData, protected syncDocSource: SyncDocSource, githubEntity: string = "issues") {
        super(organizationData, syncDocSource.docSource, githubEntity, "issues", "/internal/sync/docsources/{docSourceId}/issues");
    }

    protected getQuery(): any {
        let since = this.docSource.lastUpdated;

        if(!since) {
            since = new Date()
            since.setDate(since.getDate() -90)
        }
        return {
            direction: "desc",
            state: "all",
            per_page: 30,
            since,
            sort: 'updated'
        };
    }

    //Filter issues that are not pull requests.
    protected filterSources(sources: TSource[]): Promise<TSource[]> {
        return Promise.resolve(sources.filter((source) => !source.pull_request));
    }


    protected async converSourceToDist(source: TSource): Promise<Doc> {
        const doc: Doc = {
            docSourceId: this.docSource.id!,
            sourceId: source.number,
            subject: source.title,
            organizationId: this.docSource.organizationId,
            description: source.body,
            locked: source.locked,
            closedAt: source.closed_at,
            commentsNumber: source.comments,
            statusId:  source.state === "open" ? 1: 2,
            docTypeId: ISSUE_DOCTYPE_ID,
            createdAt: source.created_at,
            updatedAt: source.updated_at,
        }

        if(source.assignee) {
            const ahoraAssignee: AhoraUserSource = await addUserFromGithubUser(source.assignee, this.organizationData);
            doc.assigneeUserId = ahoraAssignee.userId
        }

        if(source.user) {
            const ahoraReporter: AhoraUserSource = await addUserFromGithubUser(source.user, this.organizationData);
            doc.reporterUserId = ahoraReporter.userId;
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

    protected async afterSyncEntity(entity: Doc): Promise<void> { 
        //const syncCommentService = new GithubSyncCommentsService(entity, this.organizationData, this.syncDocSource);
        //await syncCommentService.sync();
    }
}