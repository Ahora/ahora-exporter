import SyncEntityService from "../Sync/SyncEntityService";
import { AhoraDocSource } from "../docsources";
import { createGithubRestClient } from "../RestClient";
import { RestCollectorClient } from "rest-collector";
import OrganizationData from "../organizationData";
import PQueue from "p-queue";
import { stdout } from "single-line-log";

export interface GitHubLabel {
    id: number,
    name: string;
    description: string;
    color: string;
}

export default abstract class GithubBaseSyncService<TDIST extends { id?: number, sourceId: number }, TSource extends { id: any }, TUPDATE = TDIST> extends SyncEntityService<TDIST, TSource, TUPDATE> {
    
    private queue: PQueue;
    private reStartInterval?: number;
    private consolelogInterval?: number;

    constructor(organizationData: OrganizationData, docSource: AhoraDocSource, private readonly githubEntity: string, ahoraEntity: string) {
        super(ahoraEntity, organizationData, docSource);

        this.queue = new PQueue({concurrency: 30});
    }

    protected getQuery(): any {
        return {};
    }

    protected async getEntities(): Promise<number> {
        let shouldContinue: boolean = true;
        let page = 1;
        let totalNumberOfEntities = 0;

        do {
            const client: RestCollectorClient = createGithubRestClient("https://api.github.com/repos/{organization}/{repo}/{githubEntity}");
            //Get by page
            let result = await client.get({ 
                query: { ...this.getQuery(), page },
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

            totalNumberOfEntities += result.data.length;
            await this.updateDist(result.data);
        } while(shouldContinue)

        return totalNumberOfEntities;
    }    

    protected async updateDist(entities: TSource[]): Promise<void> {
        entities.forEach((entity) => {
            this.queue.add(async () => {
                try {
                    await this.upsert(entity);
                } catch (error) {
                    this.queue.pause();
                    this.queue.add(async ()=> {
                        await this.upsert(entity);
                    });

                    if(this.reStartInterval) {
                        clearTimeout(this.reStartInterval);
                    }

                    this.reStartInterval = setTimeout(()=> {
                        this.queue.start();
                    }, 10 * 1000);
                }
            });
        });
    }
    
    protected async startSync() {
        const totalEntities = await this.getEntities();
        console.log(`${this.docSource.organization}/${this.docSource.repo}`, totalEntities);
        await this.queue.onIdle(); 
        
       }
}