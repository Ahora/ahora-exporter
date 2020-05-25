import { createGithubRestClient } from "./RestClient";
import { RestCollectorClient } from "rest-collector";
//import { syncIssues } from "./issues";
import OrganizationData from "./organizationData";
import { AhoraDocSource } from "./docsources";

export interface GitHubRepository{
    id: number,
    name: string;
}
const client: RestCollectorClient<GitHubRepository[]> = createGithubRestClient("https://api.github.com/orgs/{login}/repos");

export const getRepositories = async (login: string, page:number): Promise<GitHubRepository[]> => {
    const result = await client.get({
        params: { login },
        query: { page, sort: "pushed", per_page: 100 }
    });
    return result.data;
}

export const syncRepository = async (docSource: AhoraDocSource, organizationData: OrganizationData): Promise<void> => {
    try {
        //await syncLabels(docSource, organizationData);

        //console.log("Done sync labels for", docSource.repo)
        /*
        let currentIndex = 1;
        const finishIndex = currentIndex + 1000;

        let shuoldContinue: boolean = true;
        while(shuoldContinue && currentIndex<finishIndex) {
            const numberOfIssues = await syncIssues(docSource, currentIndex, false, organizationData);
            if(numberOfIssues > 0) {
                currentIndex++;
            }
            else {
                shuoldContinue = false;
            }
        }
        */
    } catch (error) {
        console.error(error);
    }
};
