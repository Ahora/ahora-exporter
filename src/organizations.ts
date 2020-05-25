import { RestCollectorClient } from "rest-collector";
import { createRestClient } from "./RestClient";

export interface GithubOrganization {
    login: string;
    description: string;
}

export interface Organization {
    login: string;
    description: string;
    displayName: string;
}

export interface AhoraOrganization extends Organization {
    id: number;
}

const usersCache: Map<string, AhoraOrganization> = new Map<string, AhoraOrganization>();
const organizationRestClient: RestCollectorClient = createRestClient("/api/organizations/{login}");
const organizatioTeamUsersRestClient: RestCollectorClient = createRestClient("/api/organizations/{organizationId}/teams/{teamId}/users");

export const addUserFromGithubOrganization = async (organization: GithubOrganization):  Promise<AhoraOrganization> => {
    return await addOrganization({
        login: organization.login,
        displayName: organization.login,
        description: organization.description
    });
}

export const addMultipleOrganization = async (organizations: GithubOrganization[], userId: number| null = null):  Promise<void> => {
    const promises:  Promise<AhoraOrganization>[] = organizations.map((org) => {

        return new Promise<AhoraOrganization>(async (resolve, reject) => {
            try {
            const ahoraOrganization = await addOrganization({
                description: org.description,
                displayName: org.login,
                login: org.login,
            });

            if(userId) {
                const usersRequest = await organizatioTeamUsersRestClient.get({
                    params: { organizationId: ahoraOrganization.login, teamId: "null" },
                    query: { userId } 
                });

                const existingUser: any[] =usersRequest.data;

                if(existingUser && existingUser.length == 0) {

                    try {
                        await organizatioTeamUsersRestClient.post({
                            params: { organizationId: ahoraOrganization.login, teamId: "null" },
                            data: { userId }
                        });
                    } catch (error) {
                        if(error.status !== 409) {
                            throw new Error("erez");
                        }
                    }
                }

            }

            resolve(ahoraOrganization);
          } catch (error) {
              reject(error);
          }
    
        });
        });

    Promise.all(promises);
}

export const addOrganization = async (organization: Organization):  Promise<AhoraOrganization> => {
    const userFromCache: AhoraOrganization | undefined = usersCache.get(organization.login);
    if(userFromCache) {
        return Promise.resolve(userFromCache);
    }

    //Try to get user from DB
    try {
        const existingOrganizationResult = await organizationRestClient.get( { params: { login: organization.login} });
        const existintOrganization: AhoraOrganization | null = existingOrganizationResult.data;
        if(existintOrganization) {
            usersCache.set(existintOrganization.description, existintOrganization);
            return existintOrganization;
        }
    
    } catch (error) {
        if(error.status !== 404 ) {
            throw error;
        }
    }

    //Add user if it's not available in cache and also in Ahora Server!
    try {
        const addOrganizationResult = await organizationRestClient.post({data: organization});
        const addedOrganization: AhoraOrganization  = addOrganizationResult.data;
        usersCache.set(addedOrganization.login, addedOrganization);
        return addedOrganization;
    } catch (error) {
        if(error.status !== 409 ) {
            throw error;
        }
        else {
            const existingOrganizationResult = await organizationRestClient.get( { params: { login: organization.login} });
            const existintOrganization: AhoraOrganization | null = existingOrganizationResult.data;
            if(existintOrganization) {
                usersCache.set(existintOrganization.description, existintOrganization);
                return existintOrganization;
            }
            throw({status: 500});
        }
    }

}
