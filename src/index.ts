import { AhoraDocSource, getAllDocSources } from "./models/docsources";
import OrganizationData, { getOrganizationData } from "./organizationData";
import { createRestClient } from "./RestClient";

const docSourceClient = createRestClient("/internal/docsources/{docSourceId}");
const doit = async (organizationId: string, docSources: AhoraDocSource[]): Promise<void> => {
    const organizationData: OrganizationData = await getOrganizationData(organizationId, docSources);

    for (let index = 0; index < organizationData.docSources.length; index++) {
        const docSource = organizationData.docSources[index];
        const startSyncTime = new Date();
        await docSourceClient.put({
            params: { organizationId: organizationData.organizationId, docSourceId: docSource.docSource.id },
            data: {
                syncing: true,
                startSyncTime
            }
        });

        await docSource.sync();

        //Report start completed
        await docSourceClient.put({
            params: { organizationId: organizationData.organizationId, docSourceId: docSource.docSource.id },
            data: {
                lastUpdated: new Date(),
                syncing: false
            }             
        });
    }
};



const start = async () => {
    const organizationDocSourceMap: Map<string, AhoraDocSource[]> = new Map();
    const sources =  await getAllDocSources();

    console.log(`total sources: ${sources.length}`);

    for (let index = 0; index < sources.length; index++) {
        const source = sources[index];

        if(!organizationDocSourceMap.has(source.organizationFK.login)) {
            organizationDocSourceMap.set(source.organizationFK.login, []);
        }

        let docSources = organizationDocSourceMap.get(source.organizationFK.login);
        if(docSources) {
            docSources.push(source);
        }
    }

    organizationDocSourceMap.forEach(async (val, key) =>{
        await doit(key, val);
    });
}

start();