import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "../RestClient";

export interface GithubUser {
    name: string;
    id: number;
    login: string;
}

export interface UserSource {
    username: string;
    displayName: string;
    authSourceId: string;
}

export interface AhoraUserSource extends UserSource {
    userId: number;
}

const usersCache: Map<string, AhoraUserSource> = new Map<string, AhoraUserSource>();
const usersRestClient: RestCollectorClient = createRestClient("/internal/users");

export const addUserFromGithubUser = async (user: GithubUser):  Promise<AhoraUserSource> => {
    return await addUser({  displayName: user.name, authSourceId: user.id.toString(), username: user.login});
}


export const addUser = async (user: UserSource):  Promise<AhoraUserSource> => {
    let userFromCache: AhoraUserSource | undefined = usersCache.get(user.authSourceId);
    if(userFromCache) {
        return Promise.resolve(userFromCache);
    }

    //Try to get user from DB
    const existingUsersResult = await usersRestClient.get( { query: { authSourceId: user.authSourceId } });
    const existingUsersResults: AhoraUserSource[] = existingUsersResult.data;
    if(existingUsersResults.length  > 0) {
        const userFromServer: AhoraUserSource = existingUsersResults[0];
        usersCache.set(userFromServer.authSourceId, userFromServer);
        userFromCache = userFromServer;
    }
    else {
        //Add user if it's not available in cache and also in Ahora Server!
        const addUserresult = await usersRestClient.post({data: user});
        const addedUser: AhoraUserSource  = addUserresult.data;
        usersCache.set(addedUser.authSourceId, addedUser);
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
