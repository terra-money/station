import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { truncate } from "@terra.kitchen/utils"
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

const SwitchWallet = () => {
  const { wallet, wallets, connect, connectedWallet } = useAuth()
  const address = useAddress()

  const localWallets = !!(wallets.length || wallet) && (
    <ul className={styles.list}>
      {wallet && (
        <li>
          <AuthButton
            onClick={() => {}}
            className={styles.wallet}
            active={true}
          >
            <Flex gap={6}>
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
            </Flex>
          </AuthButton>
        </li>
      )}
      {wallets
        .filter((wallet) => wallet.name !== connectedWallet?.name)
        .map((wallet) => {
          const { name, lock } = wallet
          const active = name === connectedWallet?.name
          const children = (
            <Flex gap={6}>
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
                <LockOutlinedIcon style={{ fontSize: 14 }} className="muted" />
              ) : (
                truncate(
                  "address" in wallet
                    ? wallet.address
                    : addressFromWords(wallet.words["330"])
                )
              )}
            </Flex>
          )

          const attrs = { className: styles.wallet, active, children }

          return (
            <li key={name}>
              {lock ? (
                <AuthButton {...attrs} to={`/auth/unlock/${name}`} />
              ) : (
                <AuthButton {...attrs} onClick={() => connect(name)} />
              )}
            </li>
          )
        })}
    </ul>
  )

  return (
    <>
      <SelectPreconfigured />
      {localWallets}
    </>
  )
}

export default SwitchWallet
