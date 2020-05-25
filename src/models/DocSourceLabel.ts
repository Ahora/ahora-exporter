export interface AhoraDocSourceLabelForUpdate {
    sourceId: number;
    name: string;
    color: string;
    description: string;
}

export interface AhoraDocSourceLabel extends AhoraDocSourceLabelForUpdate {
    id: number;
    labelId: number;
}