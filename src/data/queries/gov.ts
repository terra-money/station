import { useTranslation } from "react-i18next"
import { useQueries, useQuery } from "react-query"
import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { AccAddress, Proposal, Vote } from "@terra-money/feather.js"
import { Color } from "types/components"
import { queryKey, RefetchOptions } from "../query"
import { useInterchainLCDClient } from "./lcdClient"
import { useNetwork } from "data/wallet"
import axios from "axios"

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

export enum ProposalStatus {
  PROPOSAL_STATUS_UNSPECIFIED = "PROPOSAL_STATUS_UNSPECIFIED",
  PROPOSAL_STATUS_DEPOSIT_PERIOD = "PROPOSAL_STATUS_DEPOSIT_PERIOD",
  PROPOSAL_STATUS_VOTING_PERIOD = "PROPOSAL_STATUS_VOTING_PERIOD",
  PROPOSAL_STATUS_PASSED = "PROPOSAL_STATUS_PASSED",
  PROPOSAL_STATUS_REJECTED = "PROPOSAL_STATUS_REJECTED",
  PROPOSAL_STATUS_FAILED = "PROPOSAL_STATUS_FAILED",
  UNRECOGNIZED = "UNRECOGNIZED",
}

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
}

/* proposals */
export const useProposals = (status: ProposalStatus) => {
  const networks = useNetwork()

  return useQueries(
    Object.values(networks ?? {}).map(({ lcd, version, chainID }) => {
      return {
        queryKey: [queryKey.gov.proposals, lcd, status],
        queryFn: async () => {
          if (version === "0.46") {
            const {
              data: { proposals },
            } = await axios.get("/cosmos/gov/v1/proposals", {
              baseURL: lcd,
              params: {
                "pagination.limit": 999,
                proposal_status: Proposal.Status[status],
              },
            })

            return (
              (proposals as ProposalResult46[]).map((prop) => ({
                ...prop,
                proposal_id: prop.id,
                content: prop.messages.length
                  ? prop.messages[0]["@type"] ===
                    "/cosmos.gov.v1.MsgExecLegacyContent"
                    ? prop.messages[0].content
                    : {
                        ...prop.messages[0],
                        title: JSON.parse(prop.metadata).title,
                        description: JSON.parse(prop.metadata).summary,
                      }
                  : {
                      "@type": "/cosmos.gov.v1.TextProposal",
                      title: JSON.parse(prop.metadata).title,
                      description: JSON.parse(prop.metadata).summary,
                    },
                final_tally_result: {
                  yes: prop.final_tally_result.yes_count,
                  abstain: prop.final_tally_result.abstain_count,
                  no: prop.final_tally_result.no_count,
                  no_with_veto: prop.final_tally_result.no_with_veto_count,
                },
              })) as ProposalResult[]
            ).map((prop) => ({ prop, chain: chainID }))
          } else {
            const {
              data: { proposals },
            } = await axios.get("/cosmos/gov/v1beta1/proposals", {
              baseURL: lcd,
              params: {
                "pagination.limit": 999,
                proposal_status: Proposal.Status[status],
              },
            })
            return (proposals as ProposalResult[]).map((prop) => ({
              prop,
              chain: chainID,
            }))
          }
        },
        ...RefetchOptions.DEFAULT,
      }
    })
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

export const useProposalStatusItem = (status: ProposalStatus) => {
  const getProposalStatusItem = useGetProposalStatusItem()
  return getProposalStatusItem(status)
}

/* proposal */
export const useProposal = (id: string, chain: string) => {
  const networks = useNetwork()
  return useQuery(
    [queryKey.gov.proposal, id, chain],
    async () => {
      if (networks[chain].version === "0.46") {
        const {
          data: { proposal },
        } = await axios.get<{ proposal: ProposalResult46 }>(
          `/cosmos/gov/v1/proposals/${id}`,
          {
            baseURL: networks[chain].lcd,
          }
        )

        return {
          ...proposal,
          proposal_id: proposal.id,
          content: proposal.messages.length
            ? proposal.messages[0]["@type"] ===
              "/cosmos.gov.v1.MsgExecLegacyContent"
              ? proposal.messages[0].content
              : {
                  ...proposal.messages[0],
                  title: JSON.parse(proposal.metadata).title,
                  description: JSON.parse(proposal.metadata).summary,
                }
            : {
                "@type": "/cosmos.gov.v1.TextProposal",
                title: JSON.parse(proposal.metadata).title,
                description: JSON.parse(proposal.metadata).summary,
              },
          final_tally_result: {
            yes: proposal.final_tally_result.yes_count,
            abstain: proposal.final_tally_result.abstain_count,
            no: proposal.final_tally_result.no_count,
            no_with_veto: proposal.final_tally_result.no_with_veto_count,
          },
        } as ProposalResult
      } else {
        const {
          data: { proposal },
        } = await axios.get(`/cosmos/gov/v1beta1/proposals/${id}`, {
          baseURL: networks[chain].lcd,
        })

        return proposal as ProposalResult
      }
    },
    {
      ...RefetchOptions.INFINITY,
    }
  )
}

export interface ProposalDeposit {
  proposal_id: string
  depositor: AccAddress
  amount: [
    {
      denom: string
      amount: string
    }
  ]
}

/* proposal: deposits */
export const useDeposits = (id: string, chain: string) => {
  const networks = useNetwork()
  return useQuery(
    [queryKey.gov.deposits, id, chain],
    async () => {
      const {
        data: { deposits },
      } = await axios.get(`/cosmos/gov/v1beta1/proposals/${id}/deposits`, {
        baseURL: networks[chain].lcd,
      })

      return deposits as ProposalDeposit[]
    },
    { ...RefetchOptions.DEFAULT }
  )
}

export const useTally = (id: string, chain: string) => {
  const lcd = useInterchainLCDClient()
  return useQuery(
    [queryKey.gov.tally, id, chain],
    () => lcd.gov.tally(Number(id), chain),
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
export const useParseProposalType = (content?: ProposalResult["content"]) => {
  const type = content?.["@type"]
  return type ? sentenceCase(last(type.split(".")) ?? "") : "Unknowm proposal"
}
