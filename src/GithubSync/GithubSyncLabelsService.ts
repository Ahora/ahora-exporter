import { AhoraDocSourceLabel, AhoraDocSourceLabelForUpdate } from "../models/DocSourceLabel";
import { AhoraDocSource } from "../models/docsources";
import GithubBaseSyncService from "./GithubBaseSyncService";
import OrganizationData from "../organizationData";

export interface GitHubLabel {
    id: number,
    name: string;
    description: string;
    color: string;
}

export default class GithubSyncLabelsService extends GithubBaseSyncService<AhoraDocSourceLabel, GitHubLabel, AhoraDocSourceLabelForUpdate> {

    constructor(organizationData: OrganizationData, docSource: AhoraDocSource) {
        super(organizationData, docSource, "labels", "labels");
    }

    protected converSourceToDist(source: GitHubLabel): Promise<AhoraDocSourceLabelForUpdate> {
        const dist: AhoraDocSourceLabelForUpdate = {
            color: source.color,
            description: source.description,
            organizationId: this.docSource.organizationId,
            name: source.name,
            sourceId: source.id
        }
        return Promise.resolve(dist);
    }
}