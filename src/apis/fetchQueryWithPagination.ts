import { FetchQuery, ResponseType, Variables } from '../types';
import { fetchGql } from '../utils/fetcher';

async function fetchPaginatedQuery(
  originalQuery: string,
  variables?: Variables,
): Promise<FetchQuery> {
  let query = originalQuery;
  const cursorsStack: string[] = [];
  
  let paginationData = {
    hasNextPage: false,
    hasPrevPage: false,
    next: null as string | null,
    prev: null as string | null,
  };

  let inProgressRequest: Promise<FetchQuery> | null = null;

  async function fetch(
    _query: string,
    _variables?: Variables,
  ): Promise<FetchQuery> {
    const variables: Variables = _variables || {};

    // Ensure that the request is always an object
    if (typeof variables.request !== 'object' || variables.request === null) {
      variables.request = {};
    }

    let data: null | ResponseType = null;
    let error = null;

    const [response, _error] = await fetchGql<any>(_query, variables);
    data = response;
    error = _error;

    // Generic function to find pageInfo in the response
    const findPageInfo = (obj: any): any => {
      if (obj && typeof obj === 'object') {
        if (obj.pageInfo) {
          return obj.pageInfo;
        }
        for (const key in obj) {
          const result = findPageInfo(obj[key]);
          if (result) return result;
        }
      }

      return null;
    };

    const pageInfo = findPageInfo(data);
    if (pageInfo) {
      paginationData = {
        hasNextPage: !!pageInfo.next,
        hasPrevPage: !!pageInfo.prev,
        next: pageInfo.next,
        prev: pageInfo.prev,
      };
    }

    return {
      data,
      error,
      hasNextPage: paginationData.hasNextPage,
      hasPrevPage: paginationData.hasPrevPage,
      getNextPage: handleNext,
      getPrevPage: handlePrev,
    };
  }

  const handleNext = async () => {
    if (inProgressRequest) {
      return inProgressRequest;
    }

    if (paginationData.hasNextPage && paginationData.next) {
      cursorsStack.push(paginationData.next);

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          request: {
            ...(variables?.request || {}),
            cursor: paginationData.next,
          },
        }
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  const handlePrev = async () => {
    if (inProgressRequest) {
      return inProgressRequest;
    }

    if (paginationData.hasPrevPage) {
      cursorsStack.pop(); // Remove the current cursor
      const prevCursor = cursorsStack[cursorsStack.length - 1] || null;

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          request: {
            ...(variables?.request || {}),
            cursor: prevCursor,
          },
        }
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  return fetch(query, variables);
}

export async function fetchQueryWithPagination(
  query: string,
  variables?: Variables,
): Promise<FetchQuery> {
  return fetchPaginatedQuery(
    query,
    variables || {},
  );
}