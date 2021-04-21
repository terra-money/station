import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress } from "@terra-money/terra.js"
import { MsgExecuteContract } from "@terra-money/terra.js"
import { SAMPLE_ADDRESS } from "config/constants"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { Auto, Card } from "components/layout"
import { Form, FormItem, FormHelp, Input } from "components/form"
import NFTAssetItem from "pages/nft/NFTAssetItem"
import AddressBookList from "../AddressBook/AddressBookList"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  recipient?: AccAddress
  memo?: string
}

interface Props {
  contract: string
  id: string
}

const TransferCW721Form = ({ contract, id }: Props) => {
  const { t } = useTranslation()
  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, trigger, setValue, handleSubmit, formState } = form
  const { errors } = formState

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue("recipient", recipient)
    setValue("memo", memo)
    await trigger("recipient")
  }

  /* tx */
  const createTx = useCallback(
    ({ recipient, memo }: TxValues) => {
      if (!address || !recipient) return

      const msgs = [
        new MsgExecuteContract(address, contract, {
          transfer_nft: { recipient, token_id: id },
        }),
      ]

      return { msgs, memo }
    },
    [address, contract, id]
  )

  /* fee */
  const estimationTxValues = useMemo(() => ({ recipient: address }), [address])

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    onSuccess: { label: t("NFT"), path: "/nft" },
    queryKeys: [
      [queryKey.wasm.contractQuery, contract, { tokens: { owner: address } }],
    ],
  }

  return (
    <Auto
      columns={[
        <Card>
          <NFTAssetItem contract={contract} id={id} />

          <Tx {...tx}>
            {({ fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
                <FormItem
                  label={t("Recipient")}
                  error={errors.recipient?.message}
                >
                  <Input
                    {...register("recipient", {
                      required: true,
                      validate: validate.address(),
                    })}
                    placeholder={SAMPLE_ADDRESS}
                    autoFocus
                  />
                </FormItem>

                <FormItem
                  label={`${t("Memo")} (${t("optional")})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register("memo", {
                      validate: {
                        size: validate.size(256, "Memo"),
                        brackets: validate.memo(),
                      },
                    })}
                  />
                </FormItem>

                {fee.render()}

                <FormHelp>
                  {t("Check if this transaction requires a memo")}
                </FormHelp>

                {submit.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <AddressBookList onClick={onClickAddressBookItem} />,
      ]}
    />
  )
}

export default TransferCW721Form
