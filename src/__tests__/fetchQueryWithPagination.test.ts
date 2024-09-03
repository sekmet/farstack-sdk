import { init } from '../init';
import { fetchQueryWithPagination } from '../apis/fetchQueryWithPagination';
import { FetchQuery } from '../types';
import * as  dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname + './../../.env') });

const demoAPIKey = process.env.API_KEY ?? "";
const demoQuery = `query Channels($request: ChannelsQueryRequest!) {
  channels(request: $request) {
    items {
      createdAt
      description
      followerCount
      id
      imageUrl
      leadFid
      moderatorFid
      name
      url
      cursor
    }
    pageInfo {
      prev
      next
    }
  }
}`;

const demoVariables = {
  request: {
    channelId: 'farcaster',
    limit: 1
  }
};

const multiQuery = `query Channels($request: ChannelsQueryRequest!, $request2: ChannelsQueryRequest!) {
  farchannels: channels(request: $request) {
    items {
      createdAt
      description
      followerCount
      id
      imageUrl
      leadFid
      moderatorFid
      name
      url
      cursor
    }
    pageInfo {
      prev
      next
    }
  },
  _farchannels: channels(request: $request2) {
    items {
      createdAt
      description
      followerCount
      id
      imageUrl
      leadFid
      moderatorFid
      name
      url
      cursor
    }
    pageInfo {
      prev
      next
    }
  }
}`;

const channelFollowersQuery = `query Users($request: UsersQueryRequest!) {
  users(request: $request) {
    items {
      id
      user {
        fid
        displayName
        username
        followerCount
        followingCount
        pfp {
          url
          verified
        }
        profile {
          bio {
            channelMentions
            mentions
            text
          }
          location {
            description
            placeId
          }
        }
        viewerContext {
          canSendDirectCasts
          enableNotifications
          followedBy
          following
          hasUploadedInboxKeys
        }
        activeOnFcNetwork
      }
      verifications {
        address
        fid
        id
        protocol
        timestamp
        version
      }
      collectionsOwned
      extras {
        custodyAddress
        fid
      }
      cursor
    }
    pageInfo {
      prev
      next
    }      
  }
}`;

describe('fetchQueryWithPagination', () => {
  it('should fail if no api key is provided', async () => {
    const { data, error } = await fetchQueryWithPagination(
      demoQuery,
      demoVariables
    );
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  it('should return a promise with the data and error properties', async () => {
    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage } =
      await fetchQueryWithPagination(demoQuery, demoVariables);
    expect(error).toBeNull();
    expect(data.channels.items).toHaveLength(1);
    expect(hasNextPage).toBe(true);
    expect(hasPrevPage).toBe(false);
  });

  it('should fetch next page on getNextPage', async () => {
    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(demoQuery, demoVariables);
    expect(error).toBeNull();
    expect(data.channels.items).toHaveLength(1);
    expect(hasNextPage).toBe(true);
    expect(hasPrevPage).toBe(false);
    const nextResponse = await getNextPage();
    if (nextResponse) {
      const { data: nextData, error: nextError } = nextResponse;
      expect(nextError).toBeNull();
      expect(nextData.channels.items).toHaveLength(1);
      expect(nextData.channels.items[0].id).not.toBe(data.channels.items[0].id);
    }
  });

  it('should return hasNextPage as false if no next page, and getNextPage should return null', async () => {
    const variables = {
      request: {
        channelId: 'fardrops',
        limit: 2
      }
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(demoQuery, variables);
    expect(error).toBeNull();
    expect(data.channels.items).toHaveLength(1);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(false);
    const nextResponse = await getNextPage();
    expect(nextResponse).toBeNull();
  });

  it('should do pagination backward and forward', async () => {
    const variables = {
      request: {
        channelId: 'drops',
        limit: 1
      },
      request2: {
        channelId: 'farcaster',
        limit: 2
      }
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(multiQuery, variables);
    // page => 0
    expect(error).toBeNull();
    expect(data.farchannels.items).toHaveLength(1);
    expect(data._farchannels.items).toHaveLength(2);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(true);

    let response = {
      getNextPage,
    } as FetchQuery | null;

    // page => 0 => 1 => 2 => 3
    for (let i = 0; i < 3; i++) {
      response = await response!.getNextPage();
      if (response) {
        //expect(response?.data.farchannels.items).toBeUndefined();
        expect(response?.data.farchannels.items).toHaveLength(1);
        expect(response?.data._farchannels.items).toHaveLength(2);
      }
    }

    // page 3 => 2 => 1
    for (let i = 0; i < 2; i++) {
      response = await response!.getPrevPage();
      //expect(response?.data.farchannels).toBeUndefined();
      expect(response?.data.farchannels.items).toHaveLength(1);
      expect(response?.data._farchannels.items).toHaveLength(2);
      const nextResponse = await getNextPage();
      if (nextResponse) {
        const { data: nextData, error: nextError } = nextResponse;
        expect(nextError).toBeNull();
        expect(nextData.farchannels.items).toHaveLength(1);
        expect(nextData.farchannels.items[0].id).not.toBe(response?.data.farchannels.items[0].id);
      }
    }
    // page => 0
    response = await response!.getPrevPage();
    expect(response?.data.farchannels).toBeTruthy();
  }, 15000);

  it('should do pagination backward and forward for queries with a mismatched schema', async () => {
    const variables = {
      request: {
        channelId: 'fardrops',
        followersByFid: "333278",
        limit: 2
      }
    };

    init(demoAPIKey);

    const { data, error, hasNextPage, hasPrevPage, getNextPage } =
      await fetchQueryWithPagination(channelFollowersQuery, variables);
    // page => 0
    expect(error).toBeFalsy();
    expect(data.users.items).toHaveLength(2);
    expect(hasPrevPage).toBe(false);
    expect(hasNextPage).toBe(true);

    let response = {
      getNextPage,
    } as FetchQuery | null;

    // page => 0 => 1 => 2 => 3
    for (let i = 0; i < 3; i++) {
      response = await response!.getNextPage();
      if (response) {
        expect(response?.data.users.items).toHaveLength(2);
      }
    }

    // page 3 => 2 => 1
    for (let i = 0; i < 2; i++) {
      response = await response!.getPrevPage();
      expect(response?.data.users.items).toHaveLength(2);
    }
    // page => 0
    response = await response!.getPrevPage();
    expect(response?.data.users.items).toBeTruthy();
  }, 15000);
});
