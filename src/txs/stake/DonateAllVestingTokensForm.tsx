import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { MsgDonateAllVestingTokens } from "@terra-money/feather.js"
import { useAddress, useChainID } from "data/wallet"
import { Account, parseVestingSchedule } from "data/queries/vesting"
import { Form, FormItem, Input } from "components/form"
import { toInput } from "txs/utils"
import Tx from "../Tx"
import { useBaseAsset } from "data/token"

const DonateAllVestingTokensForm = ({ account }: { account: Account }) => {
  const { t } = useTranslation()
  const address = useAddress()
  const chainID = useChainID()
  const schedule = parseVestingSchedule(account)
  const balance = schedule.amount.total
  const baseAsset = useBaseAsset(chainID)

  /* form */
  const { handleSubmit } = useForm({ mode: "onChange" })

  /* tx */
  const createTx = useCallback(() => {
    if (!address) return
    const msgs = [new MsgDonateAllVestingTokens(address)]
    return { msgs, chainID }
  }, [address, chainID])

  /* fee */
  const estimationTxValues = useMemo(() => ({}), [])

  const tx = {
    estimationTxValues,
    createTx,
    chain: chainID,
    token: baseAsset,
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem label={t("Amount")}>
            <Input value={toInput(balance)} token="uluna" readOnly />
          </FormItem>
          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default DonateAllVestingTokensForm
