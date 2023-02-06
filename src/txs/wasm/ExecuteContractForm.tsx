import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useFieldArray, useForm } from "react-hook-form"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { MsgExecuteContract } from "@terra-money/feather.js"
import { parseJSON, validateMsg } from "utils/data"
import { queryKey } from "data/query"
import { useNetwork } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { WithTokenItem } from "data/token"
import { Form, FormGroup, FormItem } from "components/form"
import { Input, Select, EditorInput } from "components/form"
import { getCoins, getPlaceholder } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useIBCHelper } from "../IBCHelperContext"
import { getChainIDFromAddress } from "utils/bech32"
import { useInterchainAddresses } from "auth/hooks/useAddress"

interface TxValues {
  msg: string
  coins: { input?: number; denom: CoinDenom }[]
}

const ExecuteContractForm = () => {
  const { t } = useTranslation()
  const { contract } = useParams()
  const network = useNetwork()

  if (!contract) throw new Error("Contract is not defined")

  const chainID = getChainIDFromAddress(contract, network) ?? ""
  const addresses = useInterchainAddresses()
  const address = addresses?.[chainID]
  const bankBalance = useBankBalance()

  /* tx context */
  const defaultItem = { denom: network[chainID].baseAsset }
  const { findDecimals } = useIBCHelper()

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { coins: [defaultItem] },
  })

  const { register, control, watch, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()
  const { coins } = values
  const { fields, append, remove } = useFieldArray({ control, name: "coins" })

  /* tx */
  const createTx = useCallback(
    ({ msg, ...values }: TxValues) => {
      if (!address || !validateMsg(msg)) return

      const execute_msg = parseJSON(msg)
      const coins = getCoins(values.coins, findDecimals)
      const msgs = [
        new MsgExecuteContract(address, contract, execute_msg, coins),
      ]

      return { msgs, chainID }
    },
    [address, contract, chainID, findDecimals]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])
  const tx = {
    estimationTxValues,
    coins,
    createTx,
    taxRequired: true,
    queryKeys: [
      [queryKey.wasm.contractQuery, contract, { tokens: { owner: address } }],
    ],
    chain: chainID,
  }

  const length = fields.length
  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem
            /* do not translate */
            label="Msg"
            error={errors.msg?.message}
          >
            <EditorInput
              {...register("msg", { validate: validate.msg() })}
              placeholder="{}"
              autoFocus
            />
          </FormItem>

          <FormItem label={t("Amount")}>
            {fields.map(({ id }, index) => {
              const { denom } = fields[index]
              const decimals = findDecimals(denom)

              return (
                <FormGroup
                  button={
                    length - 1 === index
                      ? {
                          onClick: () => append(defaultItem),
                          children: <AddIcon style={{ fontSize: 18 }} />,
                        }
                      : {
                          onClick: () => remove(index),
                          children: <RemoveIcon style={{ fontSize: 18 }} />,
                        }
                  }
                  key={id}
                >
                  <Input
                    {...register(`coins.${index}.input`, {
                      valueAsNumber: true,
                    })}
                    inputMode="decimal"
                    placeholder={getPlaceholder(decimals)}
                    selectBefore={
                      <Select {...register(`coins.${index}.denom`)} before>
                        {bankBalance
                          .filter(({ chain }) => chain === chainID)
                          .map(({ denom }) => (
                            <WithTokenItem token={denom} key={denom}>
                              {({ symbol }) => (
                                <option value={denom}>{symbol}</option>
                              )}
                            </WithTokenItem>
                          ))}
                      </Select>
                    }
                  />
                </FormGroup>
              )
            })}
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default ExecuteContractForm
