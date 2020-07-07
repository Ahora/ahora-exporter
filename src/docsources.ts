import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";

export interface AhoraDocSource {
    id: number;
    organization: string;
    repo: string;
    lastUpdated?: Date;
    syncing: boolean;
    organizationId: number;
    startSyncTime?: Date;
    organizationFK: {
        login: string;
    }
}

const docSourceClient: RestCollectorClient = createRestClient("/api/organizations/{organizationId}/docsources");
const internalDocSource: RestCollectorClient = createRestClient("/internal/docsources");

export const getDocSources = async (organizationId: string): Promise<AhoraDocSource[]> => {
    const result = await docSourceClient.get({ 
        params: { organizationId },
    });
    return result.data;
};


export const getAllDocSources = async (): Promise<AhoraDocSource[]> => {
    const result = await internalDocSource.get();
    return result.data;
};


export const addDocSource = async (organizationId: string, docSource: AhoraDocSource): Promise<AhoraDocSource> => {
    const result = await docSourceClient.post({ 
        params: { organizationId },
        data: docSource
    });
    return result.data;
}  