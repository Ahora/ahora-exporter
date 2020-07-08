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



const getData = async () => {
    const organizationDocSourceMap: Map<string, AhoraDocSource[]> = new Map();
    const sources =  await getAllDocSources();

    console.log(`total sources: ${sources.length}`);

    sources.forEach((source) => {
        if(!organizationDocSourceMap.has(source.organizationFK.login)) {
            organizationDocSourceMap.set(source.organizationFK.login, []);
        }

        let docSources = organizationDocSourceMap.get(source.organizationFK.login);
        if(docSources) {
            docSources.push(source);
        }
    });

    organizationDocSourceMap.forEach(async (val, key) =>{
        await doit(key, val);
    });
}
getData();
/*

const addSource =  async(organization: string, repo: string) => {
    const source = await addDocSource(organization, {
        organization,
        repo,
        syncing: false
    });

    console.log("added", repo);
}


const addAllOrgRepo =  async(organization: string, page:number=1) => {

    const repos = await getRepositories(organization, page);

    repos.forEach(async (repo) => {
        try {
            const source = await addDocSource(organization, {
                repo: repo.name,
                organization: organization,
                syncing: false
            });
            console.log("added", repo);
        } catch (error) {
            console.error(error);
        }
       

    })

}

const addRepos = async (orgName: string,  total: number) => {
    for (let index = 1; index < total + 1; index++) {
        await addAllOrgRepo(orgName, index);
    }
}

//addRepos(orgName, 16);
//addSource("kubernetes", "kubernetes");
//addSource("openshift", "cluster-api-provider-baremetal")
//addSource("kubevirt", "node-maintenance-operator")

const orgs = ["kubernetes", "openshift", "observatorium"]

try {
    for (let index = 0; index < orgs.length; index++) {
        const currentOrgName = orgs[index];
        doit(currentOrgName);
    }
} catch (error) {
    console.log(error);
}

*/