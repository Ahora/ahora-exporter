import { Doc } from "../models/Doc";
import OrganizationData from "../organizationData";
import SyncDocSource from "../Sync/SyncDocSource";
import GithubSyncIssuesService, { GithubIssue } from "./GithubSyncIssuesService";
import { GithubUser, AhoraUserSource, addUserFromGithubUser } from "../models/users";
import { PULL_REQUEST_ID } from "../models/docTypes";

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


    //Override filter sources to allow all entities if getting pull requests
    protected filterSources(sources: GithubPull[]): Promise<GithubPull[]> {
        return Promise.resolve(sources);
    }

    protected async converSourceToDist(source: GithubPull): Promise<Doc> {
        const doc = await super.converSourceToDist(source);
        doc.docTypeId = PULL_REQUEST_ID;

        let mergedByUserId: number | undefined;


        if(source.state === "open") {
            if(source.draft) {
                doc.statusId = 4;
            }
        }
        else {
            if(source.merged_at) {
                source.closed_at = source.merged_at;
                doc.statusId = 3;

                if(source.user) {
                    const ahoraAssignee: AhoraUserSource = await addUserFromGithubUser(source.user, this.organizationData);
                    mergedByUserId = ahoraAssignee.userId;
                }
            }
        }

        doc.metadata= {
            draft: source.draft,
            merge_commit_sha: source.merge_commit_sha,
            mergeable: source.mergeable,
            merged_at: source.merged_at,
            merged_by: mergedByUserId
        };

        return doc;
    }
}
