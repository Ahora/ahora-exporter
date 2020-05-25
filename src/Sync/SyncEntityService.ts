
import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./../RestClient";
import { AhoraDocSource } from "../docsources";
import OrganizationData from "../organizationData";


export default abstract class SyncEntityService<TCreate extends { id?: any, sourceId: number }, TSource extends { id: any }, TUPDATE = TCreate > {
    private readonly client: RestCollectorClient<TCreate>;
    private entitiesMap: Map<number, TCreate>;

    constructor(private entityName: string, protected organizationData: OrganizationData, protected docSource: AhoraDocSource) {
        this.client = createRestClient(`/api/organizations/{organizationId}/docsources/{docSourceId}/{entityName}`);
        this.entitiesMap = new Map<number, TCreate>();
    }

    protected abstract getEntities(): Promise<TSource[]>;
    protected abstract converSourceToDist(source: TSource): Promise<TUPDATE>;
    public abstract sync(): Promise<void>;

    public async load() {
        const entitiesResult = await this.client.get({
            params: { 
                organizationId: this.organizationData.organizationId, 
                docSourceId: this.docSource.id,
                entityName: this.entityName
            }
        });
        //TODO change client api to return array!
        const entities: TCreate[] = entitiesResult.data as any;
        entities.forEach((entity) => {
            this.entitiesMap.set(entity.sourceId, entity.id);
        });
    }

    public async upsert(source: TSource): Promise<TCreate> {
        const labelFromCache: TCreate | undefined = this.entitiesMap.get(source.id);
        if(labelFromCache) {
            return Promise.resolve(labelFromCache);
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
            this.entitiesMap.set(source.id, entityFromServer);
            return entityFromServer;
        }
    }
}