import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { truncate } from "@terra.kitchen/utils"
import { Flex } from "components/layout"
import { useAddress } from "data/wallet"
import AuthButton from "../../components/AuthButton"
import MultisigBadge from "../../components/MultisigBadge"
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
            <Flex gap={4}>
              {is.multisig(wallet) && <MultisigBadge />}
              <strong>{"name" in wallet ? wallet.name : "Ledger"}</strong>
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
            <>
              <Flex gap={4}>
                {is.multisig(wallet) && <MultisigBadge />}
                <strong>{name}</strong>
              </Flex>

              {lock ? (
                <LockOutlinedIcon fontSize="inherit" className="muted" />
              ) : (
                truncate(address)
              )}
            </>
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
