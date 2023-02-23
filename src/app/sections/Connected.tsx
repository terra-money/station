import { useState } from "react"
import { useTranslation } from "react-i18next"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import GroupsIcon from "@mui/icons-material/Groups"
import UsbIcon from "@mui/icons-material/Usb"
import BluetoothIcon from "@mui/icons-material/Bluetooth"
import { truncate } from "@terra.kitchen/utils"
import { useAddress } from "data/wallet"
import { useTnsName } from "data/external/tns"
import { Button, Copy } from "components/general"
import CopyStyles from "components/general/Copy.module.scss"
import { FlexColumn, Grid } from "components/layout"
import { Tooltip, Popover, List } from "components/display"
import { isWallet, useAuth } from "auth"
import SwitchWallet from "auth/modules/select/SwitchWallet"
import PopoverNone from "../components/PopoverNone"
import styles from "./Connected.module.scss"
import { sandbox } from "auth/scripts/env"
import { useRecoilState } from "recoil"
import { isWalletBarOpen, walletBarRoute, Path } from "pages/wallet/Wallet"

const Connected = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { wallet, getLedgerKey } = useAuth()
  const { data: name } = useTnsName(address ?? "")
  const [, setWalletIsOpen] = useRecoilState(isWalletBarOpen)
  const [, setWalletRoute] = useRecoilState(walletBarRoute)

  /* hack to close popover */
  const [key, setKey] = useState(0)
  const closePopover = () => setKey((key) => key + 1)

  if (!address) return null

  const footer = sandbox
    ? {
        to: "/auth",
        onClick: closePopover,
        children: t("Manage wallets"),
      }
    : undefined

  const handleRouteToAddresses = () => {
    setWalletIsOpen(true)
    setWalletRoute({ path: Path.receive, previousPage: { path: Path.wallet } })
    closePopover()
  }

  const list = [
    {
      onClick: handleRouteToAddresses,
      children: t("View wallet Addresses"),
      icon: <AccountBalanceWalletIcon />,
    },
  ]

  return (
    <Popover
      key={key}
      content={
        <PopoverNone className={styles.popover} footer={footer}>
          <Grid gap={16}>
            <Grid gap={4}>
              <List list={list} />
              {isWallet.ledger(wallet) && (
                <Tooltip content={t("Show address in Ledger device")}>
                  <button
                    className={CopyStyles.button}
                    onClick={async () => {
                      const lk = await getLedgerKey("330")
                      lk.showAddressAndPubKey("terra")
                    }}
                  >
                    <UsbIcon fontSize="inherit" />
                  </button>
                </Tooltip>
              )}
            </Grid>

            <SwitchWallet />
          </Grid>
        </PopoverNone>
      }
      placement="bottom-end"
      theme="none"
    >
      <Button
        icon={
          isWallet.ledger(wallet) ? (
            wallet.bluetooth ? (
              <BluetoothIcon style={{ fontSize: 16 }} />
            ) : (
              <UsbIcon style={{ fontSize: 16 }} />
            )
          ) : isWallet.multisig(wallet) ? (
            <GroupsIcon style={{ fontSize: 16 }} />
          ) : (
            <AccountBalanceWalletIcon style={{ fontSize: 16 }} />
          )
        }
        size="small"
        outline
        className={styles.button}
      >
        <span className={styles.button__text}>
          {isWallet.local(wallet) ? wallet.name : truncate(name ?? address)}
        </span>
      </Button>
    </Popover>
  )
}

export default Connected
