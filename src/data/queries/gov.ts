import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { Proposal, Vote } from "@terra-money/feather.js"
import { Color } from "types/components"
import { Pagination, queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useNetwork } from "data/wallet"

export const useVotingParams = (chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.votingParams, chain],
    () => lcd.gov.votingParameters(chain),
    { ...RefetchOptions.INFINITY }
  )
}

export const useDepositParams = (chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.depositParams, chain],
    () => lcd.gov.depositParameters(chain),
    { ...RefetchOptions.INFINITY }
  )
}

export const useTallyParams = (chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.tallyParams, chain],
    () => lcd.gov.tallyParameters(chain),
    {
      ...RefetchOptions.INFINITY,
    }
  )
}

/* proposals */
export const useProposals = (status: Proposal.Status) => {
  const lcd = useInterchainLCDClient()
  const networks = useNetwork()
  return useQuery(
    [queryKey.gov.proposals, status],
    async () => {
      const chainList = Object.keys(networks)
      // TODO: Pagination
      // Required when the number of results exceed 100
      // About 50 passed propsals from 2019 to 2021
      const proposals = await Promise.all(
        chainList.map((chainID) =>
          lcd.gov.proposals(chainID, {
            proposal_status: status,
            ...Pagination,
          })
        )
      )

      return proposals
        .reduce(
          (acc, cur, i) => {
            cur[0].map((prop) => acc.push({ prop, chain: chainList[i] }))
            return acc
          },
          [] as { prop: Proposal; chain: string }[]
          // remove proposals with unsupported protobuf content
        )
        .filter(({ prop }) => prop.content)
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useGetProposalStatusItem = () => {
  const { t } = useTranslation()

  return (status: Proposal.Status) =>
    ({
      [Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD]: {
        label: t("Voting"),
        color: "info" as Color,
      },
      [Proposal.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD]: {
        label: t("Deposit"),
        color: "info" as Color,
      },
      [Proposal.Status.PROPOSAL_STATUS_PASSED]: {
        label: t("Passed"),
        color: "success" as Color,
      },
      [Proposal.Status.PROPOSAL_STATUS_REJECTED]: {
        label: t("Rejected"),
        color: "danger" as Color,
      },
      [Proposal.Status.PROPOSAL_STATUS_FAILED]: {
        label: t("Error during execution"),
        color: "danger" as Color,
      },
      [Proposal.Status.PROPOSAL_STATUS_UNSPECIFIED]: {
        label: "",
        color: "danger" as Color,
      },
      [Proposal.Status.UNRECOGNIZED]: {
        label: "",
        color: "danger" as Color,
      },
    }[status])
}

export const useProposalStatusItem = (status: Proposal.Status) => {
  const getProposalStatusItem = useGetProposalStatusItem()
  return getProposalStatusItem(status)
}

/* proposal */
export const useProposal = (id: number, chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.proposal, id, chain],
    () => lcd.gov.proposal(id, chain),
    {
      ...RefetchOptions.INFINITY,
    }
  )
}

/* proposal: deposits */
export const useDeposits = (id: number, chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.deposits, id, chain],
    async () => {
      // TODO: Pagination
      // Required when the number of results exceed 100
      const [deposits] = await lcd.gov.deposits(id, chain)
      return deposits
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useTally = (id: number, chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.tally, id, chain],
    () => lcd.gov.tally(id, chain),
    {
      ...RefetchOptions.DEFAULT,
    }
  )
}

/* proposal: votes */
export const useGetVoteOptionItem = () => {
  const { t } = useTranslation()

  const getItem = (status: Vote.Option) =>
    ({
      [Vote.Option.VOTE_OPTION_YES]: {
        label: t("Yes"),
        color: "success" as Color,
      },
      [Vote.Option.VOTE_OPTION_NO]: {
        label: t("No"),
        color: "danger" as Color,
      },
      [Vote.Option.VOTE_OPTION_NO_WITH_VETO]: {
        label: t("No with veto"),
        color: "warning" as Color,
      },
      [Vote.Option.VOTE_OPTION_ABSTAIN]: {
        label: t("Abstain"),
        color: "info" as Color,
      },
      [Vote.Option.VOTE_OPTION_UNSPECIFIED]: {
        label: "",
        color: "danger" as Color,
      },
      [Vote.Option.UNRECOGNIZED]: {
        label: "",
        color: "danger" as Color,
      },
    }[status])

  return (param: Vote.Option | string) => {
    const option = typeof param === "string" ? Vote.Option[param as any] : param
    return getItem(option as Vote.Option)
  }
}

/* helpers */
export const useParseProposalType = (content?: Proposal.Content) => {
  if (!content || !content.toData()) return "Unknowm proposal"
  const { "@type": type } = content.toData()
  return sentenceCase(last(type.split(".")) ?? "")
}
