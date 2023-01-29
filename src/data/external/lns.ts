import { AccAddress } from "@terra-money/feather.js"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { queryKey, RefetchOptions } from "data/query"
import { useTerraContracts } from "data/Terra/TerraAssets"
import { useNetworkName } from "data/wallet"
import keccak256 from "keccak256"
import { useQuery } from "react-query"

interface LnsInfoResponse {
  owner?: AccAddress
  metadata: {
    name: string
    image: string | null
    image_data: string | null
    email: string | null
    external_url: string | null
    public_name: string
    public_bio: string | null
    twitter: string | null
    discord: string | null
    telegram: string | null
    github: string | null
    contract_address: string | null
    parent_token_id: string | null
    pgp_public_key: string | null
  }
}

export const useLnsAddress = (name: string) => {
  const lcd = useInterchainLCDClient()
  const { data: contracts } = useTerraContracts()
  const networkName = useNetworkName()

  return useQuery(
    [queryKey.LNS, networkName, name],
    async () => {
      if (!contracts) return
      const { lns: lnsCore } = contracts
      if (!lnsCore) return
      // calculate token ID
      const tokenID = keccak256(name.slice(0, -5)).toString("hex")
      try {
        const { owner } = await lcd.wasm.contractQuery<LnsInfoResponse>(
          lnsCore,
          {
            domain_info: {
              token_id: tokenID,
            },
          }
        )
        return owner
      } catch (e) {
        // domain not found
        return
      }
    },
    {
      ...RefetchOptions.INFINITY,
      enabled:
        networkName === "classic"
          ? name.endsWith(".lunc")
          : name.endsWith(".luna"),
    }
  )
}

export const useLnsName = (address: AccAddress) => {
  const lcd = useInterchainLCDClient()
  const { data: contracts } = useTerraContracts()
  const networkName = useNetworkName()

  return useQuery(
    [queryKey.LNS, networkName, address, contracts],
    async () => {
      if (!contracts) return
      const { lns: lnsCore } = contracts
      if (!lnsCore) return
      // calculate token ID
      try {
        const { name } = await lcd.wasm.contractQuery<{
          name: string
          token_id: string
        }>(lnsCore, {
          reverse_record: {
            address: address,
          },
        })

        return name + (networkName === "classic" ? ".lunc" : ".luna")
      } catch (e) {
        // name not found
        return
      }
    },
    {
      ...RefetchOptions.INFINITY,
      enabled:
        AccAddress.validate(address) &&
        AccAddress.getPrefix(address) === "terra",
    }
  )
}
