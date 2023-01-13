import { useTranslation } from "react-i18next"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import { truncate } from "@terra.kitchen/utils"
import { useAddressBook } from "data/settings/AddressBook"
import { Button } from "components/general"
import { Grid } from "components/layout"
import AddAddressBookItem from "./AddAddressBookItem"
import CustomItem from "./CustomItem"
import { useState } from "react"
import { useModal } from "components/feedback"

interface Props {
  onClick: (item: AddressBook) => void
}

const AddressBookList = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const { list, remove } = useAddressBook()
  const [open, setOpen] = useState(false)
  const close = useModal()

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
      </Grid>
    </section>
  )
}

export default AddressBookList
