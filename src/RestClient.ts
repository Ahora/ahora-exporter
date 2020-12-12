import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import { AHORA_API_URL } from "./config";

const decorateRequest = (req: RestCollectorRequest, bag?: any): void => {
    req.headers.cookie = "connect.sid=s%3AJJREfmhQ95MrMmcwSLn32iTIN55S3RH1.4loDAN9bP6OxrSyZpYR5UbveW6sgvCN1an0UqrLJSfY";
};

const GitHubRequest = (req: RestCollectorRequest, bag?: { tokens: string[]}): void => {
    if(bag) {
        const randomToken = bag.tokens[Math.floor(Math.random() * bag.tokens.length)];
        req.headers.Authorization = `token ${randomToken}`;
    }
};


export const createRestClient = (path: string): RestCollectorClient => {
    return new RestCollectorClient(`${AHORA_API_URL}${path}`,  { decorateRequest });
};


export const createGithubRestClient = (path: string): RestCollectorClient => {
    return new RestCollectorClient(path,  { decorateRequest: GitHubRequest });
};
