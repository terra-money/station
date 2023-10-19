import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import axios from "axios"
import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { Proposal, Vote } from "@terra-money/terra.js"
import { Color } from "types/components"
import { queryKey, RefetchOptions } from "../query"
import { useLCDClient } from "./lcdClient"
import { useNetwork } from "data/wallet"

/* types */
export interface ProposalResult {
  proposal_id: string
  content: {
    "@type": string
    title: string
    description: string
  } & Record<string, any>
  status: ProposalStatus

  final_tally_result: {
    yes: string
    abstain: string
    no: string
    no_with_veto: string
  }
  submit_time: string
  deposit_end_time: string
  total_deposit: [
    {
      denom: string
      amount: string
    }
  ]
  voting_start_time: string
  voting_end_time: string
}
export interface ProposalResult46 {
  id: string
  messages: GovMessage[] | LegacyGovMessage[]
  status: ProposalStatus
  final_tally_result: {
    yes_count: string
    abstain_count: string
    no_count: string
    no_with_veto_count: string
  }
  submit_time: string
  deposit_end_time: string
  total_deposit: [
    {
      denom: string
      amount: string
    }
  ]
  voting_start_time: string
  voting_end_time: string
  metadata: string
  title: string
  summary: string
  proposer: string
}

interface LegacyGovMessage {
  "@type": "/cosmos.gov.v1.MsgExecLegacyContent"
  content: {
    "@type": string
    title: string
    description: string
  } & Record<string, any>
  authority: "mars10d07y265gmmuvt4z0w9aw880jnsr700j8l2urg"
}

type GovMessage = {
  "@type": string
  authority: "mars10d07y265gmmuvt4z0w9aw880jnsr700j8l2urg"
} & Record<string, any>

export enum ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export const useVotingParams = () => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.gov.votingParams],
    () => lcd.gov.votingParameters(),
    { ...RefetchOptions.INFINITY }
  )
}

export const useDepositParams = () => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.gov.depositParams],
    () => lcd.gov.depositParameters(),
    { ...RefetchOptions.INFINITY }
  )
}

export const useTallyParams = () => {
  const lcd = useLCDClient()
  return useQuery([queryKey.gov.tallyParams], () => lcd.gov.tallyParameters(), {
    ...RefetchOptions.INFINITY,
  })
}

/* proposals */
export const useProposals = (status: Proposal.Status) => {
  const network = useNetwork()
  const { lcd: lcdURL, name } = network
  return useQuery(
    [queryKey.gov.proposals, status],
    async () => {
      let proposals

      if (name === "mainnet") {
        const response = await axios.get<{
          pagination: any
          proposals: ProposalResult46[]
        }>("/cosmos/gov/v1/proposals", {
          baseURL: lcdURL,
          params: {
            "pagination.limit": 999,
            proposal_status: Proposal.Status[status],
          },
        })

        proposals = response.data?.proposals?.map((prop) => {
          return {
            ...prop,
            proposal_id: prop.id,
            content: prop.messages.length
              ? prop.messages[0]["@type"] ===
                "/cosmos.gov.v1.MsgExecLegacyContent"
                ? prop.messages[0].content
                : {
                    ...prop.messages[0],
                    title: prop.title,
                    description: prop.summary,
                  }
              : {
                  "@type": "/cosmos.gov.v1.TextProposal",
                  title: prop.title,
                  description: prop.summary,
                },
            final_tally_result: {
              yes: prop.final_tally_result.yes_count,
              abstain: prop.final_tally_result.abstain_count,
              no: prop.final_tally_result.no_count,
              no_with_veto: prop.final_tally_result.no_with_veto_count,
            },
          }
        })

        return proposals as ProposalResult[]
      } else {
        const response = await axios.get<{ proposals: ProposalResult[] }>(
          "/cosmos/gov/v1beta1/proposals",
          {
            baseURL: lcdURL,
            params: {
              "pagination.limit": 999,
              proposal_status: Proposal.Status[status],
            },
          }
        )
        return response.data?.proposals as ProposalResult[]
      }
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useGetProposalStatusItem = () => {
  const { t } = useTranslation()

  return (status: ProposalStatus) =>
    ({
      [ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD]: {
        label: t("Voting"),
        color: "info" as Color,
      },
      [ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD]: {
        label: t("Deposit"),
        color: "info" as Color,
      },
      [ProposalStatus.PROPOSAL_STATUS_PASSED]: {
        label: t("Passed"),
        color: "success" as Color,
      },
      [ProposalStatus.PROPOSAL_STATUS_REJECTED]: {
        label: t("Rejected"),
        color: "danger" as Color,
      },
      [ProposalStatus.PROPOSAL_STATUS_FAILED]: {
        label: t("Error during execution"),
        color: "danger" as Color,
      },
      [ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED]: {
        label: "",
        color: "danger" as Color,
      },
      [ProposalStatus.UNRECOGNIZED]: {
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
export const useProposal = (id: number) => {
  const network = useNetwork()
  const { lcd: lcdURL, name } = network
  return useQuery(
    [queryKey.gov.proposal, id],
    async () => {
      if (name === "mainnet") {
        const response = await axios.get<{
          pagination: any
          proposal: ProposalResult46
        }>(`/cosmos/gov/v1/proposals/${id}`, {
          baseURL: lcdURL,
        })

        const { proposal: prop } = response.data

        return {
          ...prop,
          proposal_id: prop.id,
          content: prop.messages.length
            ? prop.messages[0]["@type"] ===
              "/cosmos.gov.v1.MsgExecLegacyContent"
              ? prop.messages[0].content
              : {
                  ...prop.messages[0],
                  title: prop.title,
                  description: prop.summary,
                }
            : {
                "@type": "/cosmos.gov.v1.TextProposal",
                title: prop.title,
                description: prop.summary,
              },
          final_tally_result: {
            yes: prop.final_tally_result.yes_count,
            abstain: prop.final_tally_result.abstain_count,
            no: prop.final_tally_result.no_count,
            no_with_veto: prop.final_tally_result.no_with_veto_count,
          },
        } as ProposalResult
      } else {
        const response = await axios.get<{ proposal: ProposalResult }>(
          `/cosmos/gov/v1beta1/proposals/${id}`,
          {
            baseURL: lcdURL,
          }
        )
        console.log(response.data)
        return response.data.proposal
      }
    },
    { ...RefetchOptions.DEFAULT }
  )
}

/* proposal: deposits */
export const useDeposits = (id: number) => {
  const lcd = useLCDClient()
  return useQuery(
    [queryKey.gov.deposits, id],
    async () => {
      // TODO: Pagination
      // Required when the number of results exceed 100
      const [deposits] = await lcd.gov.deposits(id)
      return deposits
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useTally = (id: number) => {
  const lcd = useLCDClient()
  return useQuery([queryKey.gov.tally, id], () => lcd.gov.tally(id), {
    ...RefetchOptions.DEFAULT,
  })
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
export const useParseProposalType = (content?: ProposalResult["content"]) => {
  const type = content?.["@type"]
  return type ? sentenceCase(last(type.split(".")) ?? "") : "Unknown proposal"
}
