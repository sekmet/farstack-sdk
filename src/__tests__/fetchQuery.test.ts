import { init } from '../init';
import { fetchQuery } from '../apis/fetchQuery';
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
    }
    pageInfo {
      totalCount
      next
      prev
    }
  }
}`;

describe('fetchQuery', () => {
  it('should fail if no api key is provided', async () => {
    const variables = {
      request: {
        channelId: "farcaster"
      }
    };

    const { data, error } = await fetchQuery(demoQuery, variables);
    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  it('should return a promise with the data and error properties', async () => {
    const variables = {
      request: {
        channelId: "farcaster",
        limit: 1
      }
    };

    init(demoAPIKey);

    const { data, error } = await fetchQuery(demoQuery, variables);
    expect(error).toBeNull();
    expect(data.channels.items).toHaveLength(1);
  });

  it('should return an error if the query fails', async () => {
    const query = 'query { unknownField }';
    const variables = {};
    init(demoAPIKey);

    const { error, data } = await fetchQuery(query, variables);
    expect(data).toBeFalsy();
    expect(error).toBeTruthy();
  });
});
