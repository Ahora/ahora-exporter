import { Doc } from "../models/Doc";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";
import GithubSyncIssuesService, { GithubIssue } from "./GithubSyncIssuesService";
import { GithubUser, AhoraUser, addUserFromGithubUser } from "../users";

export interface GithubPullRequestAdditionalData {
    draft: boolean;
    merged: boolean;
    merged_by?: number;
    merged_at?: Date;
    mergeable: boolean | null;
    merge_commit_sha: string;
}

export interface GithubPull extends GithubIssue {
    draft: boolean;
    merged: boolean;
    merged_by?: GithubUser;
    merged_at?: Date;
    mergeable: boolean | null;
    merge_commit_sha: string;
}

export interface AhoraPullRequest extends Doc {
    metadata?: GithubPullRequestAdditionalData;
}

export default class GithubSyncPullsService extends GithubSyncIssuesService<AhoraPullRequest, GithubPull> {
    constructor(organizationData: OrganizationData, syncDocSource: SyncDocSource) {
        super(organizationData, syncDocSource, "pulls");
    }


    //Override filter sources to allow all entities if getting pull requests
    protected filterSources(sources: GithubPull[]): Promise<GithubPull[]> {
        return Promise.resolve(sources.filter((source) => !source.pull_request));
    }

    protected async converSourceToDist(source: GithubPull): Promise<Doc> {
        const doc = await super.converSourceToDist(source);

        let mergedByUserId: number | undefined;
        if(source.merged_by) {
            const ahoraAssignee: AhoraUser = await addUserFromGithubUser(source.merged_by);
            mergedByUserId = ahoraAssignee.id
        }

        doc.metadata= {
            draft: source.draft,
            merge_commit_sha: source.merge_commit_sha,
            mergeable: source.mergeable,
            merged: source.merged,
            merged_at: source.merged_at,
            merged_by: mergedByUserId
        };

        return doc;
    }
}
