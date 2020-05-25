import { RestCollectorClient, RestCollectorRequest } from "rest-collector";

const decorateRequest = (req: RestCollectorRequest, bag?: any): void => {
    req.headers.cookie = "connect.sid=s%3AJJREfmhQ95MrMmcwSLn32iTIN55S3RH1.4loDAN9bP6OxrSyZpYR5UbveW6sgvCN1an0UqrLJSfY";
};

const GitHubRequest = (req: RestCollectorRequest, bag?: any): void => {
    req.headers.Authorization = "basic RXJlekFsc3RlcjozZWVhZjBmMWZiNWRkMDRmOGUzNDYyMjM4NGQyMjMyNTU3OTVhZWU3";
};


export const createRestClient = (path: string): RestCollectorClient => {
    //return new RestCollectorClient(`https://ahora.dev${path}`,  { decorateRequest });
    return new RestCollectorClient(`http://localhost:3001${path}`,  { decorateRequest });
};


export const createGithubRestClient = (path: string): RestCollectorClient => {
    return new RestCollectorClient(path,  { decorateRequest: GitHubRequest });
};
