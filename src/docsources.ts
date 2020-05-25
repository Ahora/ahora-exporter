import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";

export interface AhoraDocSource {
    id?: number;
    organization: string;
    repo: string;
    lastUpdated?: Date;
    syncing: boolean;
    startSyncTime?: Date;
}

const docSourceClient: RestCollectorClient = createRestClient("/api/organizations/{organizationId}/docsources");

export const getDocSources = async (organizationId: string): Promise<AhoraDocSource[]> => {
    const result = await docSourceClient.get({ 
        params: { organizationId },
    });
    return result.data;
};


export const addDocSource = async (organizationId: string, docSource: AhoraDocSource): Promise<AhoraDocSource> => {
    const result = await docSourceClient.post({ 
        params: { organizationId },
        data: docSource
    });
    return result.data;
}  