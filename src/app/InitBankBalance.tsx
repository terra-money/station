/*
 * @Author: lmk
 * @Date: 2022-08-02 17:03:00
 * @LastEditTime: 2022-08-22 16:28:37
 * @LastEditors: lmk
 * @Description:
 */
import { PropsWithChildren } from "react"
import { useInitialBankBalance } from "data/queries/bank"
import { BankBalanceProvider } from "data/queries/bank"
import { Coins } from "@terra-money/terra.js"

const InitBankBalance = ({ children }: PropsWithChildren<{}>) => {
  const { data: bankBalance } = useInitialBankBalance()
  // If the balance doesn't exist, nothing is worth rendering.
  const emptyMap = new Map()
  emptyMap.set("0", new Coins())
  // if (!bankBalance) return null
  const newBankBalance = bankBalance || (emptyMap as unknown as Coins)
  return (
    <BankBalanceProvider value={newBankBalance}>{children}</BankBalanceProvider>
  )
}

export default InitBankBalance
