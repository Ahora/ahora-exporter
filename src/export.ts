#!/usr/bin/env node
'use strict';

import { AhoraDocSource, getAllDocSources } from "./models/docsources";
import OrganizationData, { getOrganizationData } from "./organizationData";
import { createRestClient } from "./RestClient";
import {ArgumentParser} from "argparse";
const docSourceClient = createRestClient("/internal/docsources/{docSourceId}");
const doit = async (organizationId: number, docSources: AhoraDocSource[]): Promise<void> => {
    const organizationData: OrganizationData = await getOrganizationData(organizationId, docSources);

    for (let index = 0; index < organizationData.docSources.length; index++) {
        const docSource = organizationData.docSources[index];
        const startSyncTime = new Date();
        await docSourceClient.put({
            params: { docSourceId: docSource.docSource.id },
            data: {
                syncing: true,
                startSyncTime
            }
        });

        await docSource.sync();

        //Report start completed
        await docSourceClient.put({
            params: { docSourceId: docSource.docSource.id },
            data: {
                lastUpdated: new Date(),
                syncing: false
            }             
        });
    }
};


const parser = new ArgumentParser({
    description: 'Export parser'
});

parser.add_argument('--id', '-i', { required: true});
parser.add_argument('--githuborganization', '-go', { required: true});
parser.add_argument('--githubrepo', "-gr", { required: true});
parser.add_argument('--lastUpdated', "-l");
parser.add_argument('--organizationId',"-oid", { required: true});
parser.add_argument('--organizationName',"-oname", { required: true});

const result = parser.parse_args();
if(result) {
    doit(result.organizationId, [{
        id: parseInt(result.id),
        organization: result.githuborganization,
        organizationFK: { login: result.organizationName},
        organizationId: parseInt(result.organizationId) ,
        repo: result.githubrepo,
        lastUpdated: new Date(result.lastUpdated)
    }])
}