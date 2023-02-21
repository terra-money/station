import { RefetchOptions } from 'data/query'
import { useQuery } from 'react-query'
import { RangoClient } from 'rango-sdk-basic'

// TODO: get api key from env var
const rangoClient = new RangoClient('c6381a79-2817-4602-83bf-6a641a409e32')

export const useRangoMeta = () => {
  return useQuery(
    'Rango meta',
    () => rangoClient.meta(),
    RefetchOptions.INFINITY
  )
}
