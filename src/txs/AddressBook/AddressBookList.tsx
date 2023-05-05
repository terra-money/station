import { useTranslation } from "react-i18next"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import { truncate } from "@terra-money/terra-utils"
import { useAddressBook } from "data/settings/AddressBook"
import { Button } from "components/general"
import { Grid } from "components/layout"
import AddAddressBookItem from "./AddAddressBookItem"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import ContactsIcon from "@mui/icons-material/Contacts"
import CustomItem from "./CustomItem"
import { useState } from "react"
import { useModal } from "components/feedback"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import styles from "./AddressBookList.module.scss"
import { useNetwork } from "data/wallet"

interface Props {
  onClick: (item: AddressBook) => void
}

const AddressBookList = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const { list, remove } = useAddressBook()
  const [open, setOpen] = useState(false)
  const [openMy, setOpenMy] = useState(false)
  const addresses = useInterchainAddresses()
  const networks = useNetwork()
  const close = useModal()

  if (openMy) {
    return (
      <Grid gap={12}>
        <section className={styles.address__table}>
          <Grid gap={8}>
            {Object.entries(addresses ?? {}).map(([chain, address]) => {
              return (
                <button
                  className={styles.address__button}
                  onClick={() => {
                    onClick({ name: chain, recipient: address })
                    close()
                  }}
                  key={chain}
                >
                  <span>
                    <img
                      src={networks[chain]?.icon}
                      alt={networks[chain]?.name}
                    />
                    {networks[chain].name}
                  </span>
                  {truncate(address)}
                </button>
              )
            })}
          </Grid>
        </section>
        <Button onClick={() => setOpenMy(false)}>
          <ContactsIcon fontSize="inherit" />
          {t("Use your address book")}
        </Button>
      </Grid>
    )
  }

  return open ? (
    <AddAddressBookItem close={() => setOpen(false)} />
  ) : (
    <section>
      <Grid gap={12}>
        {list.map((item) => {
          const { name, recipient, memo } = item
          return (
            <CustomItem
              name={name}
              contents={[
                { title: t("Address"), desc: truncate(recipient) },
                { title: t("Memo"), desc: memo ?? "" },
              ]}
              onClick={() => {
                onClick(item)
                close()
              }}
              onDelete={() => remove(name)}
              key={name}
            />
          )
        })}
        <Button onClick={() => setOpen(true)}>
          <PersonAddOutlinedIcon fontSize="inherit" />
          {t("Add an address")}
        </Button>
        <Button onClick={() => setOpenMy(true)}>
          <AccountBalanceWalletIcon fontSize="inherit" />
          {t("Select from your addresses")}
        </Button>
      </Grid>
    </section>
  )
}

export default AddressBookList
