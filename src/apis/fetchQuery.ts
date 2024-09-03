import { fetchGql } from '../utils/fetcher';
import { FetchQuery, ResponseType, Variables } from '../types';
import { stringifyObjectValues } from '../utils/stringifyObjectValues';

export async function fetchQuery(
  query: string,
  variables?: Variables
): Promise<Pick<FetchQuery, 'data' | 'error'>> {
  // Ensure variables is an object
  const _variables: Variables = variables || {};

  // If there's a 'request' variable, ensure it's an object
  if (_variables.request && typeof _variables.request === 'string') {
    try {
      _variables.request = JSON.parse(_variables.request);
    } catch (e) {
      // If parsing fails, keep it as is
    }
  }

  // Stringify object values, but skip the 'request' object
  const processedVariables: Variables = Object.entries(_variables).reduce((acc, [key, value]) => {
    acc[key] = key === 'request' ? value : stringifyObjectValues(value);
    return acc;
  }, {} as Variables);

  let data: null | ResponseType = null;
  let error = null;

  const [response, _error] = await fetchGql<any>(query, processedVariables);
  data = response;
  error = _error;

  return {
    data,
    error,
  };
}