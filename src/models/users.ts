import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "../RestClient";

export interface GithubUser {
    name: string;
    id: number;
    login: string;
}

export interface User {
    username: string;
    displayName: string;
    gitHubId: string;
}

export interface AhoraUser extends User {
    id: number;
}

const usersCache: Map<string, AhoraUser> = new Map<string, AhoraUser>();
const usersRestClient: RestCollectorClient = createRestClient("/api/users");

export const addUserFromGithubUser = async (user: GithubUser):  Promise<AhoraUser> => {
    return await addUser({  displayName: user.name, gitHubId: user.id.toString(), username: user.login});
}


export const addUser = async (user: User):  Promise<AhoraUser> => {
    let userFromCache: AhoraUser | undefined = usersCache.get(user.gitHubId);
    if(userFromCache) {
        return Promise.resolve(userFromCache);
    }

    //Try to get user from DB
    const existingUsersResult = await usersRestClient.get( { query: { gitHubId: user.gitHubId} });
    const existingUsersResults: AhoraUser[] = existingUsersResult.data;
    if(existingUsersResults.length  > 0) {
        const userFromServer: AhoraUser = existingUsersResults[0];
        usersCache.set(userFromServer.gitHubId, userFromServer);
        userFromCache = userFromServer;
    }
    else {
        //Add user if it's not available in cache and also in Ahora Server!
        const addUserresult = await usersRestClient.post({data: user});
        const addedUser: AhoraUser  = addUserresult.data;
        usersCache.set(addedUser.gitHubId, addedUser);
        userFromCache = addedUser;
    }

    //Don't add organizations for each user
    /*
    if(userFromCache) {
        const githubResult = await userOrganizationsClient.get({
            params: { login: userFromCache.username} 
        });

        const GithubOrganizations: GithubOrganization[] = githubResult.data;
        await addMultipleOrganization(GithubOrganizations, userFromCache.id);
    }
    */

    return userFromCache;
}
