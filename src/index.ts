import { getRepositories, GitHubRepository, syncRepository } from "./repositories";
import { AhoraDocSource, getDocSources, addDocSource } from "./docsources";
import OrganizationData, { getOrganizationData } from "./organizationData";

const doit = async (organizationId: string): Promise<void> => {
    try {
        const organizationData: OrganizationData = await getOrganizationData(organizationId);
        organizationData.docSources.forEach(async (docSource) => {
            await docSource.sync();
        });
    } catch (error) {
        console.error(error);
    }
};

const addSource =  async(organization: string, repo: string) => {
    const source = await addDocSource("kubernetes", {
        organization,
        repo,
        syncing: false
    });

    console.log("added", repo);
}



const addAllOrgRepo =  async(organization: string) => {

    const repos = await getRepositories(organization, 1);

    repos.forEach(async (repo) => {
        try {
            const source = await addDocSource(organization, {
                repo: repo.name,
                organization: organization,
                syncing: false
            });
            console.log("added", source);
        } catch (error) {
            console.error(error);
        }
       

    })

}

//addAllOrgRepo("observatorium");

//addSource("kubernetes", "kubernetes");
//addSource("openshift", "cluster-api-provider-baremetal")
//addSource("kubevirt", "node-maintenance-operator")

doit("kubernetes");
