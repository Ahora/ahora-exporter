import GithubBaseSyncService from "./GithubBaseSyncService";
import { GithubUser, AhoraUser, addUserFromGithubUser } from "../users";
import { Comment } from "../models/Comment";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";

export interface GithubComment {
    id: number;
    body: string;
    created_at: string;
    user: GithubUser;
    updated_at: string;
    html_url: string;
}


export default class GithubSyncCommentsService<TDIST extends Comment = Comment, TSource extends GithubComment = GithubComment> extends GithubBaseSyncService<Comment, TSource> {

    constructor(organizationData: OrganizationData, protected syncDocSource: SyncDocSource, githubEntity: string = "issues") {
        super(organizationData, syncDocSource.docSource, githubEntity || "pulls", "issues");
    }

    protected getQuery(): any {
        return {
            state: this.docSource.lastUpdated? "all": "open",
            per_page: 100,
            since: this.docSource.lastUpdated
        };
    }

    protected async converSourceToDist(source: TSource): Promise<Comment> {

        const splitArray = source.html_url.split("#");
        const splitIssueId = splitArray[0].split("/");

        const comment: Comment = {
            sourceId: source.id,
            comment: source.body,
            createdAt: source.created_at,
            updatedAt: source.updated_at,
            githubIssueId: parseInt(splitIssueId[splitIssueId.length - 1])
        }

        if(source.user) {
            const ahoraReporter: AhoraUser = await addUserFromGithubUser(source.user);
            comment.authorUserId = ahoraReporter.id;
        }

        return comment;
    }
}