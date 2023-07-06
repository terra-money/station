import { useCallback, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFieldArray, useForm } from "react-hook-form"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { AccAddress, Coins, MsgSubmitProposal } from "@terra-money/feather.js"
import {
  TextProposal,
  CommunityPoolSpendProposal,
} from "@terra-money/feather.js"
import { ParameterChangeProposal, ParamChange } from "@terra-money/feather.js"
import { ExecuteContractProposal } from "@terra-money/feather.js/dist/core/wasm/proposals"
import { isDenomTerraNative } from "@terra-money/terra-utils"
import { readAmount, toAmount } from "@terra-money/terra-utils"
import { SAMPLE_ADDRESS } from "config/constants"
import { getAmount } from "utils/coin"
import { has } from "utils/num"
import { parseJSON } from "utils/data"
import { combineState, queryKey } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { ExternalLink } from "components/general"
import { Card, Grid } from "components/layout"
import { Form, FormGroup, FormItem } from "components/form"
import { FormHelp, FormWarning } from "components/form"
import { Input, TextArea, Select } from "components/form"
import { TooltipIcon } from "components/display"
import { getCoins, getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx from "../Tx"
import { useCommunityPool } from "data/queries/distribution"
import { useDepositParams } from "data/queries/gov"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useNetwork } from "data/wallet"
import { useNativeDenoms } from "data/token"

enum ProposalType {
  TEXT = "Text proposal",
  SPEND = "Community pool spend",
  PARAMS = "Parameter change",
  EXECUTE = "Execute contract",
}

interface DefaultValues {
  title: string
  description: string
  chain?: string
  input?: number
}

interface TextProposalValues extends DefaultValues {
  type: ProposalType.TEXT
}

interface CommunityPoolSpendProposalValues extends DefaultValues {
  type: ProposalType.SPEND
  spend: { input?: number; denom: CoinDenom; recipient: AccAddress }
}

interface ParameterChangeProposalValues extends DefaultValues {
  type: ProposalType.PARAMS
  changes: ParamChange[]
}

interface ExecuteContractProposalValues extends DefaultValues {
  type: ProposalType.EXECUTE
  runAs: AccAddress
  contractAddress: AccAddress
  msg: string
  coins: { input?: number; denom: CoinDenom }[]
}

type TxValues =
  | TextProposalValues
  | CommunityPoolSpendProposalValues
  | ParameterChangeProposalValues
  | ExecuteContractProposalValues

const DEFAULT_PAREMETER_CHANGE = { subspace: "", key: "", value: "" }

const SubmitProposalForm = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const readNetiveDenom = useNativeDenoms()

  const bankBalance = useBankBalance()
  const balance =
    bankBalance.find((b) => b.denom === networks[chain].baseAsset)?.amount ??
    "0"

  /* tx context */
  const defaultCoinItem = { denom: networks[chain].baseAsset }

  const { data: communityPool, ...communityPoolState } = useCommunityPool(chain)
  const { data: depositParams, ...depositParamsState } = useDepositParams(chain)
  const state = combineState(communityPoolState, depositParamsState)
  //if(!depositParams || communityPool) return null
  const minDeposit = depositParams
    ? getAmount(depositParams.min_deposit, networks[chain].baseAsset)
    : 0

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { input: toInput(minDeposit), coins: [defaultCoinItem] },
  })

  const { register, trigger, control, watch, setValue, handleSubmit } = form
  const { errors } = form.formState
  const { input, ...values } = watch()
  const amount = toAmount(input)
  const { fields, append, remove } = useFieldArray({
    control,
    name: "changes",
  })
  const coinsFieldArray = useFieldArray({ control, name: "coins" })

  /* update input */
  useEffect(() => {
    setValue("input", toInput(minDeposit))
  }, [minDeposit, setValue])

  /* effect: ParameterChangeProposal */
  const shouldAppendChange =
    values.type === ProposalType.PARAMS && !values.changes.length

  useEffect(() => {
    if (shouldAppendChange) append(DEFAULT_PAREMETER_CHANGE)
  }, [append, shouldAppendChange])

  /* tx */
  const createTx = useCallback(
    ({ input, title, description, ...values }: TxValues) => {
      if (!addresses) return
      const amount = toAmount(input)
      const deposit = has(amount)
        ? new Coins({ [networks[chain].baseAsset]: amount })
        : []

      const getContent = () => {
        if (values.type === ProposalType.SPEND) {
          const { input, denom, recipient } = values.spend
          const coins = new Coins({ [denom]: toAmount(input) })
          return new CommunityPoolSpendProposal(
            title,
            description,
            recipient,
            coins
          )
        }

        if (values.type === ProposalType.PARAMS) {
          const { changes } = values
          return new ParameterChangeProposal(title, description, changes)
        }

        if (values.type === ProposalType.EXECUTE) {
          const { runAs, contractAddress, msg } = values
          const execute_msg = parseJSON(msg)
          const coins = getCoins(values.coins)
          return new ExecuteContractProposal(
            title,
            description,
            runAs,
            contractAddress,
            execute_msg,
            coins
          )
        }

        return new TextProposal(title, description)
      }

      const msgs = [
        new MsgSubmitProposal(getContent(), deposit, addresses[chain]),
      ]
      return { msgs, chainID: chain ?? "" }
    },
    [addresses, chain, networks]
  )

  /* fee */
  const estimationTxValues = useMemo(
    (): TextProposalValues => ({
      type: ProposalType.TEXT,
      title: ESTIMATE.TITLE,
      description: ESTIMATE.DESCRIPTION,
      input: toInput(balance),
    }),
    [balance]
  )

  const onChangeMax = useCallback(
    async (input: number) => {
      setValue("input", input)
      await trigger("input")
    },
    [setValue, trigger]
  )

  const tx = {
    token: networks[chain].baseAsset,
    amount,
    balance,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [queryKey.gov.proposals],
    chain: chain ?? "",
    gasAdjustment: 1.5,
  }

  const render = () => {
    if (values.type === ProposalType.SPEND) {
      // @ts-expect-error
      const max = values.spend && getAmount(communityPool, values.spend.denom)
      const placeholder = readAmount(max, { integer: true })

      return (
        <>
          <FormItem
            label={t("Recipient")}
            error={
              "spend" in errors ? errors.spend?.recipient?.message : undefined
            }
          >
            <Input
              {...register("spend.recipient", {
                validate: validate.address(),
              })}
              placeholder={SAMPLE_ADDRESS}
            />
          </FormItem>

          <FormItem
            label={t("Amount")}
            error={"spend" in errors ? errors.spend?.input?.message : undefined}
          >
            <Input
              {...register("spend.input", {
                valueAsNumber: true,
                validate: validate.input(toInput(max)),
              })}
              inputMode="decimal"
              placeholder={placeholder}
              selectBefore={
                <Select {...register("spend.denom")} before>
                  {[networks[chain].baseAsset].map((denom) => (
                    <option value={denom} key={denom}>
                      {readNetiveDenom(denom).symbol}
                    </option>
                  ))}
                </Select>
              }
            />
          </FormItem>
        </>
      )
    }

    if (values.type === ProposalType.PARAMS) {
      const length = fields.length
      return (
        <FormItem label={t("Changes")}>
          {fields.map(({ id }, index) => (
            <FormGroup
              button={
                length - 1 === index
                  ? {
                      onClick: () => append(DEFAULT_PAREMETER_CHANGE),
                      children: <AddIcon style={{ fontSize: 18 }} />,
                    }
                  : {
                      onClick: () => remove(index),
                      children: <RemoveIcon style={{ fontSize: 18 }} />,
                    }
              }
              key={id}
            >
              {/* do not translate labels here */}
              <FormItem label="subspace">
                <Input
                  {...register(`changes.${index}.subspace`, {
                    required: "`subspace` is required",
                  })}
                  placeholder="staking"
                />
              </FormItem>

              <FormItem label="key">
                <Input
                  {...register(`changes.${index}.key`, {
                    required: "`key` is required",
                  })}
                  placeholder="MaxValidators"
                />
              </FormItem>

              <FormItem label="value">
                <Input
                  {...register(`changes.${index}.value`, {
                    required: "`value` is required",
                  })}
                  placeholder="100"
                />
              </FormItem>
            </FormGroup>
          ))}
        </FormItem>
      )
    }

    if (values.type === ProposalType.EXECUTE) {
      const { fields, append, remove } = coinsFieldArray
      const length = fields.length

      return (
        <>
          <FormItem
            label={t("Run as")}
            error={"runAs" in errors ? errors.runAs?.message : undefined}
          >
            <Input
              {...register("runAs", { validate: validate.address() })}
              placeholder={SAMPLE_ADDRESS}
            />
          </FormItem>

          <FormItem
            label={t("Contract address")}
            error={
              "contractAddress" in errors
                ? errors.contractAddress?.message
                : undefined
            }
          >
            <Input
              {...register("contractAddress", { validate: validate.address() })}
              placeholder={SAMPLE_ADDRESS}
            />
          </FormItem>

          <FormItem
            /* do not translate */
            label="Msg"
            error={"msg" in errors ? errors.msg?.message : undefined}
          >
            <TextArea
              {...register("msg", { validate: validate.msg() })}
              placeholder="{}"
            />
          </FormItem>

          <FormItem label={t("Amount")}>
            {fields.map(({ id }, index) => (
              <FormGroup
                button={
                  length - 1 === index
                    ? {
                        onClick: () => append(defaultCoinItem),
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
                      {bankBalance
                        .filter(({ denom }) => isDenomTerraNative(denom))
                        .map(({ denom }) => (
                          <option value={denom} key={denom}>
                            {readNetiveDenom(denom).symbol}
                          </option>
                        ))}
                    </Select>
                  }
                />
              </FormGroup>
            ))}
          </FormItem>
        </>
      )
    }
  }

  return (
    <Card {...state} inputCard>
      <Tx {...tx}>
        {({ max, fee, submit }) => (
          <Form onSubmit={handleSubmit(submit.fn)}>
            <Grid gap={4}>
              {networks[chain]?.prefix === "terra" && (
                <FormHelp>
                  Upload proposal only after forum discussion on{" "}
                  <ExternalLink href="https://agora.terra.money">
                    agora.terra.money
                  </ExternalLink>
                </FormHelp>
              )}
              <FormWarning>
                {t(
                  "Proposal deposits will not be refunded if the proposal is vetoed, fails to meet quorum, or does not meet the minimum deposit"
                )}
              </FormWarning>
              {values.type === ProposalType.TEXT && (
                <FormWarning>
                  {t("Parameters cannot be changed by text proposals")}
                </FormWarning>
              )}
            </Grid>

            <FormItem label={t("Proposal type")} error={errors.type?.message}>
              <Select {...register("type")}>
                {Object.values(ProposalType ?? {}).map((type) => (
                  <option value={type} key={type}>
                    {t(type)}
                  </option>
                ))}
              </Select>
            </FormItem>

            <FormItem label={t("Title")} error={errors.title?.message}>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder={t("Burn community pool")}
                autoFocus
              />
            </FormItem>

            <FormItem
              label={t("Description")}
              error={errors.description?.message}
            >
              <TextArea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder={t(
                  `We're proposing to spend 100,000 ${
                    readNetiveDenom(networks[chain].baseAsset).symbol
                  } from the Community Pool to fund the creation of public goods for the ${
                    networks[chain].name
                  } ecosystem`
                )}
              />
            </FormItem>

            <FormItem
              label={
                <TooltipIcon
                  content={`To help push the proposal to the voting period, consider depositing more ${
                    readNetiveDenom(networks[chain].baseAsset).symbol
                  } to reach the minimum ${
                    Number(minDeposit) /
                    10 ** readNetiveDenom(networks[chain].baseAsset).decimals
                  } ${
                    readNetiveDenom(networks[chain].baseAsset).symbol
                  } (optional).`}
                >
                  {t("Initial deposit")} ({t("optional")})
                </TooltipIcon>
              }
              extra={max.render()}
              error={errors.input?.message}
            >
              <Input
                {...register("input", {
                  valueAsNumber: true,
                  validate: validate.input(
                    toInput(max.amount),
                    undefined,
                    "Initial deposit",
                    true
                  ),
                })}
                token={networks[chain].baseAsset}
                onFocus={max.reset}
                inputMode="decimal"
                placeholder={getPlaceholder()}
              />
            </FormItem>

            {render()}
            {fee.render()}
            {submit.button}
          </Form>
        )}
      </Tx>
    </Card>
  )
}

export default SubmitProposalForm

/* fee estimation */
const ESTIMATE = {
  TITLE: "Lorem ipsum",
  DESCRIPTION:
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
}
