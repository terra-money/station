import { useState } from "react"
import { useTranslation } from "react-i18next"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import GroupsIcon from "@mui/icons-material/Groups"
import QrCodeIcon from "@mui/icons-material/QrCode"
import UsbIcon from "@mui/icons-material/Usb"
import { truncate } from "@terra.kitchen/utils"
import { useWallet } from "@terra-money/wallet-provider"
import { useAddress } from "data/wallet"
import { useTnsName } from "data/external/tns"
import { Button, Copy, FinderLink } from "components/general"
import CopyStyles from "components/general/Copy.module.scss"
import { Flex, Grid } from "components/layout"
import { Tooltip, Popover } from "components/display"
import { isWallet, useAuth } from "auth"
import SwitchWallet from "auth/modules/select/SwitchWallet"
import PopoverNone from "../components/PopoverNone"
import WalletQR from "./WalletQR"
import styles from "./Connected.module.scss"
import { ModalButton, Mode } from "components/feedback"
import { RenderButton } from "types/components"
import WalletMenuButton from "./WalletMenuButton"
import MobileStyles from "./MobileItem.module.scss"
import ConnectedWalletMenuButton from "./ConnectedWalletMenuButton"

interface Props {
  renderButton?: RenderButton
}

const Connected = () => {
  const { t } = useTranslation()
  const { disconnect } = useWallet()
  const address = useAddress()
  const { wallet, getLedgerKey } = useAuth()
  const { data: name } = useTnsName(address ?? "")

  /* hack to close popover */
  const [key, setKey] = useState(0)
  const closePopover = () => setKey((key) => key + 1)

  if (!address) return null

  const footer = wallet
    ? { to: "/auth", onClick: closePopover, children: t("Manage wallets") }
    : { onClick: disconnect, children: t("Disconnect") }

  const connectedList = () => (
    <Grid gap={isWallet.mobile() ? 0 : 16}>
      <Grid gap={4} className={styles.mobileItem}>
        <section>
          {isWallet.mobile() ? (
            <FinderLink className={styles.link} short>
              {address}
            </FinderLink>
          ) : (
            <Tooltip content={t("View on Terra Finder")}>
              <FinderLink className={styles.link} short>
                {address}
              </FinderLink>
            </Tooltip>
          )}
        </section>

        <Flex gap={4} start>
          <Copy text={address} />
          <WalletQR
            renderButton={(open) =>
              isWallet.mobile() ? (
                <button className={CopyStyles.button} onClick={open}>
                  <QrCodeIcon fontSize="inherit" />
                </button>
              ) : (
                <Tooltip content={t("Show address as QR code")}>
                  <button className={CopyStyles.button} onClick={open}>
                    <QrCodeIcon fontSize="inherit" />
                  </button>
                </Tooltip>
              )
            }
          />

          {isWallet.ledger(wallet) && (
            <Tooltip content={t("Show address in Ledger device")}>
              <button
                className={CopyStyles.button}
                onClick={async () => {
                  const lk = await getLedgerKey()
                  lk.showAddressAndPubKey()
                }}
              >
                <UsbIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}

          <ConnectedWalletMenuButton />
          {/*{isWallet.mobileNative() && <ConnectedWalletMenuButton />}*/}
        </Flex>
      </Grid>
      <SwitchWallet />
      {isWallet.mobile() &&
        (wallet ? (
          <WalletMenuButton />
        ) : (
          <div onClick={disconnect} className={MobileStyles.item}>
            {t("Disconnect")}
          </div>
        ))}
    </Grid>
  )

  const defaultRenderButton: Props["renderButton"] = (open) => (
    <Button
      icon={
        isWallet.multisig(wallet) ? (
          <GroupsIcon style={{ fontSize: 16 }} />
        ) : (
          <AccountBalanceWalletIcon style={{ fontSize: 16 }} />
        )
      }
      size="small"
      outline
      onClick={open}
    >
      {isWallet.local(wallet) ? wallet.name : truncate(name ?? address)}
    </Button>
  )

  return isWallet.mobile() ? (
    <ModalButton
      title={t("Connect wallet")}
      renderButton={defaultRenderButton}
      modalType={Mode.BOTTOM}
      maxHeight
    >
      {connectedList()}
    </ModalButton>
  ) : (
    <Popover
      key={key}
      content={
        <PopoverNone className={styles.popover} footer={footer}>
          {connectedList()}
        </PopoverNone>
      }
      placement="bottom-end"
      theme="none"
    >
      <Button
        icon={
          isWallet.multisig(wallet) ? (
            <GroupsIcon style={{ fontSize: 16 }} />
          ) : (
            <AccountBalanceWalletIcon style={{ fontSize: 16 }} />
          )
        }
        size="small"
        outline
      >
        {isWallet.local(wallet) ? wallet.name : truncate(name ?? address)}
      </Button>
    </Popover>
  )
}

export default Connected
