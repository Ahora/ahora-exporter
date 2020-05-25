import { getRepositories, GitHubRepository, syncRepository } from "./repositories";
import { AhoraDocSource, getDocSources, addDocSource } from "./docsources";
import OrganizationData, { getOrganizationData } from "./organizationData";

const doit = async (organizationId: string): Promise<void> => {
    try {
        const organizationData: OrganizationData = await getOrganizationData(organizationId);

        for (let index = 0; index < organizationData.docSources.length; index++) {
            const docSource = organizationData.docSources[index];
            await docSource.sync();
        }
    } catch (error) {
        console.error(error);
    }
};

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
const orgName: string = "observatorium";
//addRepos(orgName, 16);


//addSource("kubernetes", "kubernetes");
//addSource("openshift", "cluster-api-provider-baremetal")
//addSource("kubevirt", "node-maintenance-operator")

try {
    doit(orgName);
} catch (error) {
    console.log(error);
}
