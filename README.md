# Farstack SDK

<p style="text-align: center;">
<img src="https://rose-narrow-lemur-593.mypinata.cloud/ipfs/QmVRk2rusxkMAqTRqMi2Yskx1kpevDmRgsHvXmxkPd11n4" />
</p>
The Farstack SDK provides a convenient way for web developers to integrate Farstack into typescript/javascript applications.

With the provided methods, you can use to easily query and fetch data from the farcaster network.

## Installation

#### With NPM

```sh
npm install @sekmet/farstack
```

#### With yarn

```sh
yarn add @sekmet/farstack
```

#### With pnpm

```sh
pnpm install @sekmet/farstack
```

#### With bun

```sh
bun add @sekmet/farstack
```

## Getting started

To use the SDK you will need a Farstack API key, once you have it you can call the `init` function with the apiKey.

**`init` must be called before calling fetchQuery or  fetchQueryWithPagination**.

```typescript
import { init } from "@sekmet/farstack";

init("apiKey");
```

## fetchQuery

##### Parameters
`fetchQuery` accepts 2 parameters:
- `query` (required): A string that represents the Farstack GraphQL query to be executed.
- `variables`: An object that contains variables used in the query.

*example:*

```json
    const variables = {
      request: {
        channelId: 'fardrops',
        limit: 2
      }
    };
```


`fetchQuery` returns a promise with an object, which contains the following properties:

- `data`: The response data returned by the server.
- `error`: An error object, if an error occurred during the network request.

##### Example

```typescript
import { fetchQuery } from "@sekmet/farstack";

const { data, error } = await fetchQuery(query, variables);
```

## fetchQueryWithPagination

##### Parameters
`fetchQueryWithPagination` take same parameters as `fetchQuery`.

It returns a promise with an object, which contains the following properties:

- `data`: The response data returned by the server.
- `error`: An error object, if an error occurred during the network request.
- `hasNextPage`: A boolean that indicates whether there is a next page of data available.
- `hasPrevPage`: A boolean that indicates whether there is a previous page of data available.
- `getNextPage()`: A function that returns a next page `data`, `error`, `hasNextPage`, `hasPrevPage`, `getNextPage` and `getPrevPage`. It returns `null` if there is no next page.
- `getPrevPage()`: A function that returns previous page `data`, `error`, `hasNextPage`, `hasPrevPage`, `getNextPage` and `getPrevPage`. It returns `null` if there is no previous page.
  
**Note:** fetchQueryWithPagination only works with queries that has support for pagination.

##### Example

```typescript
import { fetchQueryWithPagination } from "@sekmet/farstack";

const { data, error, hasNextPage, hasPrevPage, getNextPage, getPrevPage } =
  await fetchQueryWithPagination(query, variables);
```
