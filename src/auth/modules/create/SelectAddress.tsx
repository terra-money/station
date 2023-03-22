import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import { readAmount } from "@terra-money/terra-utils"
import { MnemonicKey, AccAddress } from "@terra-money/feather.js"
import { Coins, Delegation, UnbondingDelegation } from "@terra-money/feather.js"
import { sortCoins } from "utils/coin"
import { useInterchainLCDClient } from "data/queries/lcdClient"
import { useCurrency } from "data/settings/Currency"
import { useThemeAnimation } from "data/settings/Theme"
import { Flex, Grid } from "components/layout"
import { Form, Submit } from "components/form"
import { Tag } from "components/display"
import AuthButton from "../../components/AuthButton"
import { useCreateWallet } from "./CreateWalletWizard"
import styles from "./SelectAddress.module.scss"
import { useNativeDenoms } from "data/token"

const SelectAddress = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const lcd = useInterchainLCDClient()
  const readNativeDenom = useNativeDenoms()
  const { values, createWallet } = useCreateWallet()
  const { mnemonic, index } = values

  /* query */
  const { data: results } = useQuery(
    // FIXME: remove mnemonic from this array
    ["mnemonic", mnemonic, index],
    async () => {
      const results = await Promise.allSettled(
        ([118, 330] as const).map(async (bip) => {
          const mk = new MnemonicKey({ mnemonic, coinType: bip, index })
          const address = mk.accAddress("terra")
          const [balance] = await lcd.bank.balance(address)
          const [delegations] = await lcd.staking.delegations(address)
          const [unbondings] = await lcd.staking.unbondingDelegations(address)
          return { address, bip, index, balance, delegations, unbondings }
        })
      )

      return results.map((result) => {
        if (result.status === "rejected") throw new Error()
        return result.value
      })
    },
    {
      onSuccess: (results) => {
        const account118 = results.find(({ bip }) => bip === 118)
        if (!account118) return
        const { balance, delegations, unbondings } = account118
        const is118Empty =
          !balance.toData().length && !delegations.length && !unbondings.length
        if (is118Empty) createWallet(330, index)
      },
    }
  )

  /* form */
  const form = useForm<{ bip?: Bip }>()
  const { watch, setValue, handleSubmit } = form
  const { bip } = watch()

  const submit = ({ bip }: { bip?: Bip }) => {
    if (!bip) return
    createWallet(bip, index)
  }

  /* render */
  const animation = useThemeAnimation()

  if (!results)
    return (
      <Flex>
        <img src={animation} width={80} height={80} alt={t("Loading...")} />
      </Flex>
    )

  interface Details {
    address: AccAddress
    bip: Bip
    balance: Coins
    delegations: Delegation[]
    unbondings: UnbondingDelegation[]
  }

  const renderDetails = ({ address, bip, ...rest }: Details) => {
    const { balance, delegations, unbondings } = rest
    const coins = sortCoins(balance, currency.id)
    const length = coins.length

    return (
      <Grid gap={4}>
        <Grid gap={12}>
          <Flex gap={8} start>
            <Tag color="info" small>
              {bip}
            </Tag>

            {!!delegations.length && (
              <Tag color="info" small>
                {t("Delegated")}
              </Tag>
            )}

            {!!unbondings.length && (
              <Tag color="info" small>
                {t("Undelegated")}
              </Tag>
            )}
          </Flex>

          <h1>{address}</h1>
        </Grid>

        <Flex gap={4} start className={styles.coins}>
          {coins
            .slice(0, 3)
            .map((coin) =>
              [
                readAmount(coin.amount),
                readNativeDenom(coin.denom).symbol,
              ].join(" ")
            )
            .join(", ")}

          {length - 3 > 0 && (
            <span className="muted">
              {t("+{{length}} coins", { length: length - 3 })}
            </span>
          )}
        </Flex>
      </Grid>
    )
  }

  return (
    <Grid gap={20}>
      <Form onSubmit={handleSubmit(submit)}>
        {results.map((item) => {
          return (
            <AuthButton
              className={styles.button}
              onClick={() => setValue("bip", item.bip)}
              active={item.bip === bip}
              key={item.bip}
            >
              {renderDetails(item)}
            </AuthButton>
          )
        })}

        <Submit />
      </Form>
    </Grid>
  )
}

export default SelectAddress
