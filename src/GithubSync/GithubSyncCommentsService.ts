import GithubBaseSyncService from "./GithubBaseSyncService";
import { GithubUser, AhoraUserSource, addUserFromGithubUser } from "../models/users";
import { Comment } from "../models/Comment";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";
import { Doc } from "../models/Doc";

export interface GithubComment {
    id: number;
    body: string;
    created_at: string;
    user: GithubUser;
    updated_at: string;
    html_url: string;
}


export default class GithubSyncCommentsService extends GithubBaseSyncService<Comment, GithubComment> {

    constructor(protected doc: Doc, organizationData: OrganizationData, protected syncDocSource: SyncDocSource) {
        super(organizationData, syncDocSource.docSource, `issues/${doc.sourceId}/comments`, "comments", "/internal/sync/docsources/{docSourceId}/comments");
    }

    protected getQuery(): any {
        return {
            per_page: 100,
            since: this.docSource.lastUpdated
        };
    }

    protected async converSourceToDist(source: GithubComment): Promise<Comment> {
        const comment: Comment = {
            sourceId: source.id,
            comment: source.body,
            createdAt: source.created_at,
            updatedAt: source.updated_at,
            docId: this.doc.id!
        }

        if(source.user) {
            const ahoraReporter: AhoraUserSource = await addUserFromGithubUser(source.user, this.organizationData);
            comment.authorUserId = ahoraReporter.userId;
        }
        return comment;
    }
}