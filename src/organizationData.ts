import { getStatuses, AhoraDocStatus } from "./stratuses";
import { AhoraDocType, getDocTypes } from "./docTypes";
import { AhoraDocSource, getDocSources } from "./docsources";
import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";
import SyncDocSource from "./Sync/SyncDocSource";
import { AhoraDoc } from "./models/Doc";

export default class OrganizationData {
    public readonly statusesMap: Map<string, AhoraDocStatus>;
    public readonly docTypesMap: Map<string, AhoraDocType>;
    public readonly docSources: SyncDocSource[];


    constructor(public readonly organizationId: string) {
        this.statusesMap = new Map<string, AhoraDocStatus>();
        this.docTypesMap = new Map<string, AhoraDocType>();
        this.docSources = []
        
    }

    public addDocSource(docSource: SyncDocSource) {
        this.docSources.push(docSource);
    }
} 


export const getOrganizationData = async (organizationId: string, docSources: AhoraDocSource[]): Promise<OrganizationData>=> {

    const data: OrganizationData = new OrganizationData(organizationId);

    //Load data from Ahora servers
    const statuses: AhoraDocStatus[] = await getStatuses(organizationId);
    const docTypes: AhoraDocType[] = await getDocTypes(organizationId);

    //Fill in doc types!
    docTypes.forEach((docType) => { data.docTypesMap.set(docType.code, docType); });

    //Fill in statuses!
    statuses.forEach((status) => {
        if(status.name === "Opened") {
            data.statusesMap.set("open", status);
        }
        else if(status.name === "Closed") {
            data.statusesMap.set("closed", status);
        }
    });

    //Generate SyncDocSource and send organization data mostly for issues sync (getting accesses to statuses and doc types)
    docSources.forEach((source: AhoraDocSource) => {
        data.addDocSource(new SyncDocSource(data, source));
    });

    return data;
}

