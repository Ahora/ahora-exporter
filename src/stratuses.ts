import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";

export interface AhoraDocStatus {
    id: number;
    name: string;
    color?: string;
    description?: string;
    organizationId: number;
}

const docStatusClient: RestCollectorClient<AhoraDocStatus[]> = createRestClient("/api/organizations/{organizationId}/statuses");

export const getStatuses = async (organizationId: string): Promise<AhoraDocStatus[]> => {
    const result = await docStatusClient.get({ 
        params: { organizationId },
    });
    return result.data;
};