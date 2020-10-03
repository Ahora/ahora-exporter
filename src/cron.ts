#!/usr/bin/env node
'use strict';

import k8s, { KubeConfig, CustomObjectsApi} from "@kubernetes/client-node";
import { getAllDocSources } from "./models/docsources";



const start = async () => {
    console.log("get sources");
    const sources =  await getAllDocSources();

    try {
        console.log("started to load kube config");
        const kc = new KubeConfig();
        try {
            kc.loadFromDefault();
            console.log("finished to load kube config");

        } catch (error) {
            console.log("--------------------------failed to load from cluster!----------------------------");
            throw error;
        }

        console.log("setting api objected");
        const k8sApi = kc.makeApiClient(CustomObjectsApi);
        console.log("Done setting api objected");
        sources.forEach(async (source) => {

            const cr: any = {
                "apiVersion": "argoproj.io/v1alpha1",
                "kind": "Workflow",
                "metadata": {
                    "generateName": `ahora-exporter-sync-${source.id}-`,
                },
                "spec": {
                    "arguments": {
                        "parameters": [
                            { name: "id",  value: `${source.id}` },
                            { name: "organization",  value: `${source.organization}` },
                            { name: "repo",  value: `${source.repo}` },
                            { name: "lastUpdated",  value: `${source.lastUpdated}` },
                            { name: "organizationId",  value: `${source.organizationId}` }
                        ]
                    },
                    entrypoint: "github-exporter",
                    workflowTemplateRef: {
                        name: "ahoraexporter-github-exporter"
                    }
                }
            };
    

            try {
                console.log(`calling crd: ${source.organizationId} ${source.organization} ${source.repo}`);
                const tolat = await k8sApi.createNamespacedCustomObject("argoproj.io", "v1alpha1", "master", "workflows" , cr);
                console.log(`pushed crd: ${source.organizationId} ${source.organization} ${source.repo}`);
            } catch (error) {
                console.log(`error ${source.repo}!`);
                console.log(error);
            }

        });

    } catch (error) {
        console.log("-------------------------------error--------------------------------");
        console.log(error);
    }



  

}

start();