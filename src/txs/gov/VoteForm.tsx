import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import classNames from "classnames/bind"
import { MsgVote, Vote } from "@terra-money/feather.js"
import { useGetVoteOptionItem } from "data/queries/gov"
import { Form } from "components/form"
import useProposalId from "pages/gov/useProposalId"
import Tx from "../Tx"
import styles from "./VoteForm.module.scss"
import { useInterchainAddresses } from "auth/hooks/useAddress"

const cx = classNames.bind(styles)

interface TxValues {
  option: Vote.Option
}

const Options = [
  Vote.Option.VOTE_OPTION_YES,
  Vote.Option.VOTE_OPTION_ABSTAIN,
  Vote.Option.VOTE_OPTION_NO,
  Vote.Option.VOTE_OPTION_NO_WITH_VETO,
]

const VoteForm = () => {
  const getVoteOptionItem = useGetVoteOptionItem()
  const { id, chain } = useProposalId()

  if (!id) throw new Error("Proposal is not defined")

  const addresses = useInterchainAddresses()

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, watch, handleSubmit } = form
  const { option } = watch()
  const selected = Number(option)

  /* tx */
  const createTx = useCallback(
    ({ option }: TxValues) => {
      if (!addresses) return
      const msgs = [new MsgVote(Number(id), addresses[chain], Number(option))]
      return { msgs, chainID: chain }
    },
    [addresses, id, chain]
  )

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ option: Vote.Option.VOTE_OPTION_YES }),
    []
  )

  const tx = {
    estimationTxValues,
    createTx,
    chain,
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <section className={styles.options}>
            {Options.map((option) => {
              const { color, label } = getVoteOptionItem(option)
              const className = cx(styles.option, color, `border-${color}`, {
                active: selected === option,
              })

              return (
                <label className={className} key={option}>
                  <input
                    {...register("option")}
                    type="radio"
                    value={option}
                    hidden
                  />
                  {label}
                </label>
              )
            })}
          </section>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default VoteForm
