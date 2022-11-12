import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { last } from "ramda"
import { sentenceCase } from "sentence-case"
import { Proposal, Vote } from "@terra-money/terra.js"
import { Color } from "types/components"
import { Pagination, queryKey, RefetchOptions, useIsClassic } from "../query"
import { useLCDClient } from "./lcdClient"
import { PaginationOptions } from "@terra-money/terra.js/dist/client/lcd/APIRequester"

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
export const useProposals = (
  status: Proposal.Status,
  paginationOptions: Partial<PaginationOptions>
) => {
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.gov.proposals, status, paginationOptions],
    async () => {
      const proposals = await lcd.gov.proposals({
        proposal_status: status,
        ...Pagination,
        ...paginationOptions,
      })
      return proposals
    },
    { ...RefetchOptions.DEFAULT, keepPreviousData: true }
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
export const useProposal = (id: number) => {
  const lcd = useLCDClient()
  return useQuery([queryKey.gov.proposal, id], () => lcd.gov.proposal(id), {
    ...RefetchOptions.INFINITY,
  })
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
export const useParseProposalType = (content: Proposal.Content) => {
  const isClassic = useIsClassic()
  const { "@type": type } = content.toData(isClassic)
  return sentenceCase(last(type.split(".")) ?? "")
}
