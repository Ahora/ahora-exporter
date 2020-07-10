
import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./../RestClient";
import { AhoraDocSource } from "../models/docsources";
import OrganizationData from "../organizationData";


export default abstract class SyncEntityService<TCreate extends { id?: any, sourceId: number }, TSource extends { id: any }, TUPDATE = TCreate > {
    private readonly client: RestCollectorClient<TCreate>;
    private entitiesMap: Map<number, TCreate | Promise<TCreate>>;

    constructor(private entityName: string, protected organizationData: OrganizationData, protected docSource: AhoraDocSource, ahoraEndpoint: string = "/internal/sync/docsources/{docSourceId}/{entityName}") {
        this.client = createRestClient(ahoraEndpoint);
        this.entitiesMap = new Map<number, TCreate>();
    }

    protected abstract getEntities(): Promise<number>;
    protected abstract converSourceToDist(source: TSource): Promise<TUPDATE>;
    protected abstract startSync(): Promise<void>;
    protected afterSyncEntity(entity: TCreate): Promise<void> { return Promise.resolve(); }
    protected abstract async updateDist(sources: TSource[]): Promise<void>;

    public async sync(): Promise<void> {
        await this.startSync(); 
    }
    public async load() {
        const entitiesResult = await this.client.get({
            params: { 
                organizationId: this.organizationData.organizationId, 
                docSourceId: this.docSource.id,
                entityName: this.entityName
            }
        });
        const entities: TCreate[] = entitiesResult.data as any;
        entities.forEach((entity) => {
            this.entitiesMap.set(entity.sourceId, entity.id);
        });
    }

    public async upsert(source: TSource): Promise<TCreate> {
        const entityFromCache: TCreate | Promise<TCreate> | undefined = this.entitiesMap.get(source.id);
        if(entityFromCache) {

            if(entityFromCache instanceof Promise) {
                return await entityFromCache;
            }
            else {
                return Promise.resolve(entityFromCache);
            }
        }
        else {
            const dist = await this.converSourceToDist(source);
            const result = await this.client.post({
                params: { 
                    organizationId: this.organizationData.organizationId, 
                    docSourceId: this.docSource.id,
                    entityName: this.entityName
                },
                data: dist
            });
            const entityFromServer = result.data;
            await this.afterSyncEntity(entityFromServer);
            this.entitiesMap.set(source.id, entityFromServer);
            return entityFromServer;            
        }
    }
}