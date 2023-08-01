import { GlobalState } from "./enum-type-utils";
import profilePic from "../assets/images/profile-pic.jpg";
import { EnsProfileDetails } from "../interfaces/utils";
import { log } from "dm3-lib-shared";
import { ethers } from "ethers";


// method to get avatar/image url
export const getAvatar = async (provider: ethers.providers.JsonRpcProvider, ensName: string): Promise<string | null | undefined> => {
  return await provider.getAvatar(ensName);
}

// method to fetch, check and set avatar
export const getAvatarProfilePic = async (state: GlobalState, ensName: string): Promise<string> => {
  if (state.connection.provider && ensName) {
    const data = await getAvatar(state.connection.provider, ensName);
    return data ? data : profilePic;
  } else {
    return profilePic;
  }
}

// method to fetch ENS profile details like github, email and twitter
export const getEnsProfileDetails = async (state: GlobalState, ensName: string): Promise<EnsProfileDetails> => {

  let details: EnsProfileDetails = {
    email: null,
    github: null,
    twitter: null
  };

  try {

    const provider = state.connection.provider;

    if (provider && ensName) {
      const resolver = await provider.getResolver(ensName);
      if (resolver) {
        details.email = await resolver.getText("email");
        details.github = await resolver.getText("com.github");
        details.twitter = await resolver.getText("com.twitter");
      }
    }

    return details;
  } catch (error) {
    log(error, "Error in fetching ENS profile details");
    return details;
  }

}