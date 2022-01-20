import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { useFieldArray, useForm } from "react-hook-form"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { isDenomTerraNative, readDenom } from "@terra.kitchen/utils"
import { MsgExecuteContract } from "@terra-money/terra.js"
import { sortCoins } from "utils/coin"
import { parseJSON, validateMsg } from "utils/data"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Form, FormGroup, FormItem } from "components/form"
import { Input, Select, TextArea } from "components/form"
import { getCoins, getPlaceholder } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  msg: string
  coins: { input?: number; denom: CoinDenom }[]
}

const ExecuteContractForm = () => {
  const { t } = useTranslation()
  const { contract } = useParams()

  if (!contract) throw new Error("Contract is not defined")

  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)
  const defaultItem = { denom: initialGasDenom }

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { coins: [defaultItem] },
  })

  const { register, control, watch, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()
  const { fields, append, remove } = useFieldArray({ control, name: "coins" })

  /* tx */
  const createTx = useCallback(
    ({ msg, ...values }: TxValues) => {
      if (!address || !validateMsg(msg)) return

      const execute_msg = parseJSON(msg)
      const coins = getCoins(values.coins)
      const msgs = [
        new MsgExecuteContract(address, contract, execute_msg, coins),
      ]

      return { msgs }
    },
    [address, contract]
  )

  /* fee */
  const estimationTxValues = useMemo(() => values, [values])
  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    onSuccess: { label: t("Contract"), path: "/contract" },
    queryKeys: [
      [queryKey.wasm.contractQuery, contract, { tokens: { owner: address } }],
    ],
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
            <TextArea
              {...register("msg", { validate: validate.msg() })}
              placeholder="{}"
              autoFocus
            />
          </FormItem>

          <FormItem label={t("Amount")}>
            {fields.map(({ id }, index) => (
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
                  placeholder={getPlaceholder()}
                  selectBefore={
                    <Select {...register(`coins.${index}.denom`)} before>
                      {sortCoins(bankBalance)
                        .filter(({ denom }) => isDenomTerraNative(denom))
                        .map(({ denom }) => (
                          <option value={denom} key={denom}>
                            {readDenom(denom)}
                          </option>
                        ))}
                    </Select>
                  }
                />
              </FormGroup>
            ))}
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default ExecuteContractForm
