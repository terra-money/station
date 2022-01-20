import { useTranslation } from "react-i18next"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import { truncate } from "@terra.kitchen/utils"
import usePreconfigured from "auth/hooks/usePreconfigured"
import classNames from "classnames/bind"
import { useNetwork } from "data/wallet"
import { Select } from "components/form"
import { Flex } from "components/layout"
import AuthButton from "../../components/AuthButton"
import MultisigBadge from "../../components/MultisigBadge"
import useAuth from "../../hooks/useAuth"
import is from "../../scripts/is"
import styles from "./SwitchWallet.module.scss"

const cx = classNames.bind(styles)

const SwitchWallet = () => {
  const { t } = useTranslation()
  const { connectedWallet, wallets, connect, connectPreconfigured } = useAuth()
  const preconfigured = usePreconfigured()
  const { preconfigure } = useNetwork()

  const preconfiguredWallets = preconfigure && (
    <Select
      value={connectedWallet?.name ?? ""}
      onChange={(e) => {
        const wallet = preconfigured.find(({ name }) => name === e.target.value)
        if (wallet) connectPreconfigured(wallet)
      }}
    >
      <option value="" disabled>
        {t("Preconfigured wallets...")}
      </option>

      {preconfigured.map(({ name }) => {
        return (
          <option value={name} key={name}>
            {name}
          </option>
        )
      })}
    </Select>
  )

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
      {preconfiguredWallets}
      {localWallets}
    </>
  )
}

export default SwitchWallet
