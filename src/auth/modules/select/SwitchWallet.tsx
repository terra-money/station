import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { truncate } from "@terra.kitchen/utils"
import classNames from "classnames/bind"
import { Flex } from "components/layout"
import AuthButton from "../../components/AuthButton"
import MultisigBadge from "../../components/MultisigBadge"
import useAuth from "../../hooks/useAuth"
import is from "../../scripts/is"
import SelectPreconfigured from "./SelectPreconfigured"
import styles from "./SwitchWallet.module.scss"

const cx = classNames.bind(styles)

const SwitchWallet = () => {
  const { connectedWallet, wallets, connect } = useAuth()

  const localWallets = !!wallets.length && (
    <ul className={styles.list}>
      {wallets.map((wallet) => {
        const { name, address, lock } = wallet
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

        const attrs = { className: cx(styles.wallet), active, children }

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
