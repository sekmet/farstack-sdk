import { ResponseType } from "../types";
import isAliasedPageInfo, { getCursorName } from "./cursor";

export function getPaginationData(_response: ResponseType | null): {
  nexts: Record<string, string>;
  prevs: Record<string, string>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const nexts: Record<string, string> = {};
  const prevs: Record<string, string> = {};
  let hasNextPage = false;
  let hasPrevPage = false;

  const response = _response || {};

  for (const queryName in response) {
    const query = response[queryName];
    console.log({queryName})
    for (const key in query) {
      console.log({key}, isAliasedPageInfo(key))
      if (isAliasedPageInfo(key)) {
        const { next, prev } = query[key as "pageInfo"];

        if (next) {
          nexts[getCursorName(key)] = next;
        }

        if (prev) {
          prevs[getCursorName(key)] = prev;
        }

        if (!hasNextPage) {
          hasNextPage = Boolean(next);
        }

        if (!hasPrevPage) {
          hasPrevPage = Boolean(prev);
        }
      }
    }
  }

  return {
    nexts,
    prevs,
    hasNextPage,
    hasPrevPage,
  };
}
