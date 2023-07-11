import { useQueries, useQuery } from "react-query"
import { isDenomIBC } from "@terra-money/terra-utils"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useNetwork } from "data/wallet"
import axios from "axios"
import crypto from "crypto"
import { AccAddress } from "@terra-money/feather.js"

export const useIBCBaseDenom = (
  denom: Denom,
  chainID: string,
  enabled: boolean
) => {
  const lcd = useInterchainLCDClient()
  const network = useNetwork()

  return useQuery(
    [queryKey.ibc.denomTrace, denom, chainID],
    async () => {
      const { base_denom, path } = await lcd.ibcTransfer.denomTrace(
        denom.replace("ibc/", ""),
        chainID
      )

      const paths = path.split("/")
      const chains = [chainID]
      const channels = []

      for (let i = 0; i < paths.length; i += 2) {
        const chain = chains[0]

        if (!network[chain]?.lcd) return

        const [port, channel] = [paths[i], paths[i + 1]]
        channels.unshift({ port, channel })

        const { data } = await axios.get(
          `/ibc/core/channel/v1/channels/${channel}/ports/${port}/client_state`,
          { baseURL: network[chain].lcd }
        )

        chains.unshift(data.identified_client_state.client_state.chain_id)
      }

      return {
        ibcDenom: denom,
        baseDenom: base_denom.startsWith("cw20:")
          ? base_denom.replace("cw20:", "")
          : base_denom,
        chainIDs: chains,
        channels,
      }
    },
    {
      ...RefetchOptions.INFINITY,
      enabled: isDenomIBC(denom) && !!network[chainID] && enabled,
    }
  )
}

export const useIBCBaseDenoms = (data: { denom: Denom; chainID: string }[]) => {
  const network = useNetwork()
  const lcd = useInterchainLCDClient()

  return useQueries(
    data.map(({ denom, chainID }) => {
      return {
        queryKey: [queryKey.ibc.denomTrace, denom, network],
        queryFn: async () => {
          const { base_denom, path } = await lcd.ibcTransfer.denomTrace(
            denom.replace("ibc/", ""),
            chainID
          )

          const paths = path.split("/")
          const chains = [chainID]
          const channels = []

          for (let i = 0; i < paths.length; i += 2) {
            const chain = chains[0]

            if (!network[chain]?.lcd) return

            const [port, channel] = [paths[i], paths[i + 1]]
            channels.unshift({ port, channel })

            const { data } = await axios.get(
              `/ibc/core/channel/v1/channels/${channel}/ports/${port}/client_state`,
              { baseURL: network[chain].lcd }
            )

            chains.unshift(data.identified_client_state.client_state.chain_id)
          }

          return {
            ibcDenom: denom,
            baseDenom: base_denom.startsWith("cw20:")
              ? base_denom.replace("cw20:", "")
              : // fix for kujira factory tokens
              base_denom.startsWith("factory:")
              ? base_denom.replaceAll(":", "/")
              : base_denom,
            chainIDs: chains,
            channels,
          }
        },
        ...RefetchOptions.INFINITY,
        enabled: isDenomIBC(denom) && !!network[chainID],
      }
    })
  )
}

export function calculateIBCDenom(baseDenom: string, path: string) {
  if (!path)
    return baseDenom.startsWith("factory:")
      ? baseDenom.replaceAll(":", "/")
      : baseDenom

  const assetString = [
    path,
    AccAddress.validate(baseDenom) ? `cw20:${baseDenom}` : baseDenom,
  ].join("/")
  const hash = crypto.createHash("sha256")
  hash.update(assetString)
  return `ibc/${hash.digest("hex").toUpperCase()}`
}
