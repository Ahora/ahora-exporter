import SyncEntityService from "../Sync/SyncEntityService";
import { AhoraDocSource } from "../docsources";
import { createGithubRestClient } from "../RestClient";
import { RestCollectorClient } from "rest-collector";
import OrganizationData from "../organizationData";

export interface GitHubLabel {
    id: number,
    name: string;
    description: string;
    color: string;
}

export default abstract class GithubBaseSyncService<TDIST extends { id?: number, sourceId: number }, TSource extends { id: any }, TUPDATE = TDIST> extends SyncEntityService<TDIST, TSource, TUPDATE> {
    
    constructor(organizationData: OrganizationData, docSource: AhoraDocSource, private readonly githubEntity: string, ahoraEntity: string) {
        super(ahoraEntity, organizationData, docSource);
    }

    protected async getEntities(): Promise<TSource[]> {
        let entities: TSource[] = [];
        let shouldContinue: boolean = true;
        let page = 1;

        do {
            const client: RestCollectorClient = createGithubRestClient("https://api.github.com/repos/{organization}/{repo}/{githubEntity}");
            //Get by page
            let result = await client.get({ 
                query: { page},
                params: {
                    githubEntity: this.githubEntity,
                    organization: this.docSource.organization,
                    repo: this.docSource.repo
                }
            });

            //Stop or try to add second page
            if(result.data.length===0) {
                shouldContinue = false;
            }
            else {
                page = page +1;
            }
            shouldContinue = false;
            //Join all data
            entities = [...entities, ...result.data]
        } while(shouldContinue)

        //return all entities that were found
        return entities;

    }
    
    public async sync() {
        const entities: TSource[] = await this.getEntities();
        await Promise.all(entities.map((source) => { this.upsert(source); }));
    }
}