import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { truncate } from "@terra-money/terra-utils"
import { Flex } from "components/layout"
import { useAddress } from "data/wallet"
import { addressFromWords } from "utils/bech32"
import AuthButton from "../../components/AuthButton"
import MultisigBadge from "../../components/MultisigBadge"
import UsbIcon from "@mui/icons-material/Usb"
import BluetoothIcon from "@mui/icons-material/Bluetooth"
import useAuth from "../../hooks/useAuth"
import is from "../../scripts/is"
import SelectPreconfigured from "./SelectPreconfigured"
import styles from "./SwitchWallet.module.scss"
import { useWallet } from "@terra-money/wallet-kit"

const SwitchWallet = () => {
  const { disconnect } = useWallet()
  const { wallet, wallets, connect, connectedWallet } = useAuth()
  const address = useAddress()

  const localWallets = !!(wallets.length || wallet) && (
    <div>
      <h1 className={styles.header}>Wallets</h1>
      <ul className={styles.list}>
        {wallet && (
          <li className={styles.listItem}>
            <AuthButton
              onClick={() => {}}
              className={styles.wallet}
              active={true}
            >
              <Flex gap={4}>
                {is.multisig(wallet) && <MultisigBadge />}
                {is.ledger(wallet) &&
                  (wallet.bluetooth ? (
                    <BluetoothIcon style={{ fontSize: 14 }} />
                  ) : (
                    <UsbIcon style={{ fontSize: 14 }} />
                  ))}
                <strong>{"name" in wallet ? wallet.name : "Ledger"}</strong>
              </Flex>

              {truncate(address)}
            </AuthButton>
          </li>
        )}
        {wallets
          .filter((wallet) => wallet.name !== connectedWallet?.name)
          .map((wallet) => {
            const { name, lock } = wallet
            const active = name === connectedWallet?.name
            const children = (
              <>
                <Flex gap={4}>
                  {is.multisig(wallet) && <MultisigBadge />}
                  {is.ledger(wallet) &&
                    (wallet.bluetooth ? (
                      <BluetoothIcon style={{ fontSize: 14 }} />
                    ) : (
                      <UsbIcon style={{ fontSize: 14 }} />
                    ))}
                  <strong>{name}</strong>
                </Flex>

                {lock ? (
                  <LockOutlinedIcon
                    style={{ fontSize: 14 }}
                    className="muted"
                  />
                ) : (
                  truncate(
                    "address" in wallet
                      ? wallet.address
                      : addressFromWords(wallet.words["330"])
                  )
                )}
              </>
            )

            const attrs = { className: styles.wallet, active, children }

            return (
              <li key={name}>
                {lock ? (
                  <AuthButton {...attrs} to={`/auth/unlock/${name}`} />
                ) : (
                  <AuthButton
                    {...attrs}
                    onClick={() => {
                      disconnect()
                      connect(name)
                    }}
                  />
                )}
              </li>
            )
          })}
      </ul>
    </div>
  )

  return (
    <>
      <SelectPreconfigured />
      {localWallets}
    </>
  )
}

export default SwitchWallet
