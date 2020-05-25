import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";

export const PULL_REQUEST: string = "PullRequest";
export const ISSUE: string = "Issue";

export interface AhoraDocType {
    id: number;
    name: string;
    code: string;
    description?: string;
    organizationId?: number;
    nextDocType?: number;
}

const DocTypeClient: RestCollectorClient<AhoraDocType[]> = createRestClient("/api/organizations/{organizationId}/docTypes");

export const getDocTypes = async (organizationId: string): Promise<AhoraDocType[]> => {
    const result = await DocTypeClient.get({ 
        params: { organizationId },
    });
    return result.data;
};