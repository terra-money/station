import { ReactNode } from "react"
import capitalize from "@mui/utils/capitalize"
import { isDenom } from "@terra.kitchen/utils"
import { AccAddress, Coin, Coins, ValAddress } from "@terra-money/terra.js"
import { useAddress } from "data/wallet"
import { useValidators } from "data/queries/staking"
import { WithTokenItem } from "data/token"
import { FinderLink } from "components/general"
import { Read } from "components/token"

const ValidatorAddress = ({ children: address }: { children: string }) => {
  const { data: validators } = useValidators()
  const moniker = validators?.find(
    ({ operator_address }) => operator_address === address
  )?.description.moniker

  return (
    <FinderLink value={address} short={!moniker} validator>
      {moniker ?? address}
    </FinderLink>
  )
}

const Tokens = ({ children: coins }: { children: string }) => {
  const list = new Coins(coins).toArray()

  return (
    <>
      {list.length > 1
        ? "multiple tokens" // Do not translate this
        : list.map((coin) => {
            const data = coin.toData()
            const { denom } = data

            return (
              <WithTokenItem token={denom} key={denom}>
                {({ decimals }) => <Read {...data} decimals={decimals} />}
              </WithTokenItem>
            )
          })}
    </>
  )
}

interface Props {
  children?: string
  className?: string
}

const TxMessage = ({ children: sentence, className }: Props) => {
  const address = useAddress()
  if (!sentence) return null

  const parse = (word: string, index: number): ReactNode => {
    if (!word) return null
    if (word.endsWith(",")) return <>{parse(word.slice(0, -1), index)},</>
    const isMe = word === address

    return validateTokens(word) ? (
      <Tokens>{word}</Tokens>
    ) : AccAddress.validate(word) ? (
      <FinderLink value={word} short={!isMe}>
        {isMe ? "my wallet" /* Do not translate this */ : word}
      </FinderLink>
    ) : ValAddress.validate(word) ? (
      <ValidatorAddress>{word}</ValidatorAddress>
    ) : !index ? (
      capitalize(word)
    ) : (
      word
    )
  }

  return (
    <p className={className}>
      {sentence
        .split(" ")
        .filter((word, index) => index || word !== address)
        .map((word, index) => {
          const parsed = parse(word, index)

          return !index ? (
            <strong key={index}>{parsed}</strong>
          ) : (
            <span key={index}> {parsed}</span>
          )
        })}
    </p>
  )
}

export default TxMessage

/* helpers */
const validateTokens = (tokens: any) => {
  const validate = ({ denom }: Coin) =>
    isDenom(denom) || AccAddress.validate(denom)

  try {
    const coins = new Coins(tokens)
    return coins.toArray().every(validate)
  } catch {
    return false
  }
}
