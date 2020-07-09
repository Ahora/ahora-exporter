export interface AhoraDocSourceLabelForUpdate {
    sourceId: number;
    name: string;
    color: string;
    description: string;
    organizationId: number;
}

export interface AhoraDocSourceLabel extends AhoraDocSourceLabelForUpdate {
    id: number;
    labelId: number;
}