import { ResponseType } from "../types";
import isAliasedPageInfo from "./cursor";

export function getQueriesWithLastPage(data: ResponseType) {
  const queriesWithLastPage: Record<
    string,
    {
      next: string;
      prev: string;
    }
  > = {};

  for (const queryName in data) {
    const query = data[queryName];
    for (const key in query) {
      if (isAliasedPageInfo(key)) {
        const { next, prev } = query[key as "pageInfo"];
        if (!next) {
          queriesWithLastPage[queryName] = {
            next,
            prev,
          };
        }
      }
    }
  }
  return queriesWithLastPage;
}
