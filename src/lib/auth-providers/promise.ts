import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface PromiseProfile {
  uid: string;
}

export default function PromiseProvider<P extends PromiseProfile>(
  options: OAuthUserConfig<P> & { clientId: string }
): OAuthConfig<P> {
  return {
    id: "promise",
    name: "Promise",
    type: "oauth",
    authorization: {
      url: "https://promiseauthentication.org/auth",
      params: {
        client_id: options.clientId,
        response_type: "code",
      },
    },
    token: {
      url: "https://promiseauthentication.org/oauth/token",
    },
    userinfo: {
      url: "https://promiseauthentication.org/oauth/userinfo",
    },
    profile(profile) {
      return {
        id: profile.uid,
        name: null,
        email: null,
        image: null,
      };
    },
    options,
  };
}
