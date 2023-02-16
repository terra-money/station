import { ConnectType, useConnectedWallet } from "@terra-money/use-wallet"
import { useIsWalletEmpty } from "data/queries/bank"
import { useTranslation } from "react-i18next"

export const StartSwapProcess = () => {
  const { t } = useTranslation()

  const connectedWallet = useConnectedWallet()
  const isWalletEmpty = useIsWalletEmpty()

  // const walletError =
  //   connectedWallet?.connectType === ConnectType.READONLY
  //     ? t("Wallet is connected as read-only mode")
  //     : !availableGasDenoms.length
  //       ? t("Insufficient balance to pay transaction fee")
  //       : isWalletEmpty
  //         ? t("Coins required to post transactions")
  //         : ""
  // return (
  //   <>
  //     {walletError && <FormError>{walletError}</FormError>}

  //     {!addresses ? (
  //       <ConnectWallet
  //         renderButton={(open) => (
  //           <Submit type="button" onClick={open}>
  //             {t("Connect wallet")}
  //           </Submit>
  //         )}
  //       />
  //     ) : (
  //       <Grid gap={4}>
  //         {failed ? (
  //           <FormError>{failed}</FormError>
  //         ) : (
  //           passwordRequired && (
  //             <FormItem label={t("Password")} error={incorrect}>
  //               <Input
  //                 type="password"
  //                 value={password}
  //                 onChange={(e) => {
  //                   setIncorrect(undefined)
  //                   setPassword(e.target.value)
  //                 }}
  //               />
  //             </FormItem>
  //           )
  //         )}

  //         <Submit
  //           disabled={!estimatedGas || !!disabled || !!walletError}
  //           submitting={submitting}
  //         >
  //           {submitting ? submittingLabel : disabled}
  //         </Submit>
  //       </Grid>
  //     )}
  //   </>
  // )
}
