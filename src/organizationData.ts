import { AhoraDocSource } from "./models/docsources";
import SyncDocSource from "./Sync/SyncDocSource";
import { createRestClient } from "./RestClient";

const docSourceClient = createRestClient("/internal/organizations/{organizationId}/accesstokens");


export default class OrganizationData {
    public readonly docSources: SyncDocSource[];


    constructor(public readonly organizationId: number, public readonly tokens: string[]) {
        this.docSources = []
        
    }

    public addDocSource(docSource: SyncDocSource) {
        this.docSources.push(docSource);
    }
} 


export const getOrganizationData = async (organizationId: number, docSources: AhoraDocSource[]): Promise<OrganizationData>=> {
    const tokensResult =await  docSourceClient.get({ params: { organizationId }});
    const tokens: string[] = tokensResult.data;
    console.log(`got ${tokens.length} relevant tokens`);
    const data: OrganizationData = new OrganizationData(organizationId, tokens);
    //Generate SyncDocSource and send organization data mostly for issues sync (getting accesses to statuses and doc types)
    docSources.forEach((source: AhoraDocSource) => {
        data.addDocSource(new SyncDocSource(data, source));
    });

    return data;
}

