import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "../RestClient";

export interface AhoraDocSource {
    id: number;
    organization: string;
    repo: string;
    lastUpdated?: Date;
    organizationId: number;
    startSyncTime?: Date;
    organizationFK: {
        login: string;
    }
}

const internalDocSource: RestCollectorClient = createRestClient("/internal/docsources");

export const getAllDocSources = async (): Promise<AhoraDocSource[]> => {
    const result = await internalDocSource.get();
    return result.data;
};
