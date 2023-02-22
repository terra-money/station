import { RefetchOptions } from "data/query"
import { useQuery } from "react-query"
import { RangoClient } from "rango-sdk-basic"

// TODO: get api key from env var
const RANGO_API_KEY = "c6381a79-2817-4602-83bf-6a641a409e32"
// const RANGO_API_KEY = '93f4efaa-caab-4458-97d8-196faadb7923'

const rangoClient = new RangoClient(RANGO_API_KEY)
/*
{
    "apiKey":"93f4efaa-caab-4458-97d8-196faadb7923",
    "rateLimitPerSecond": 5,
    "title": "TerraStation",
    "allowedDomains": [
        "http://localhost:3000"
    ]
}
*/

export const useRangoMeta = () => {
  return useQuery(
    "Rango meta",
    () => rangoClient.meta(),
    RefetchOptions.INFINITY
  )
}
