import { AhoraDocSource } from "./models/docsources";
import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";
import SyncDocSource from "./Sync/SyncDocSource";
import { AhoraDoc } from "./models/Doc";

export default class OrganizationData {
    public readonly docSources: SyncDocSource[];


    constructor(public readonly organizationId: string) {
        this.docSources = []
        
    }

    public addDocSource(docSource: SyncDocSource) {
        this.docSources.push(docSource);
    }
} 


export const getOrganizationData = async (organizationId: string, docSources: AhoraDocSource[]): Promise<OrganizationData>=> {

    const data: OrganizationData = new OrganizationData(organizationId);
    //Generate SyncDocSource and send organization data mostly for issues sync (getting accesses to statuses and doc types)
    docSources.forEach((source: AhoraDocSource) => {
        data.addDocSource(new SyncDocSource(data, source));
    });

    return data;
}

