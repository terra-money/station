import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import AddIcon from "@mui/icons-material/Add"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import { truncate } from "@terra.kitchen/utils"
import { useAddressBook } from "data/settings/AddressBook"
import { InternalButton } from "components/general"
import { Card, Grid } from "components/layout"
import { Empty, ModalButton } from "components/feedback"
import AddAddressBookItem from "./AddAddressBookItem"
import CustomItem from "./CustomItem"

interface Props {
  onClick: (item: AddressBook) => void
}

const AddressBookList = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const { list, remove } = useAddressBook()

  const renderModalButton = (renderButton: (open: () => void) => ReactNode) => (
    <ModalButton title={t("Add a new address")} renderButton={renderButton}>
      <AddAddressBookItem />
    </ModalButton>
  )

  return (
    <Card
      title={t("Address book")}
      extra={renderModalButton((open) => (
        <button type="button" onClick={open}>
          <AddIcon />
        </button>
      ))}
    >
      {!list.length ? (
        <Empty icon={<PersonAddOutlinedIcon fontSize="inherit" />}>
          {renderModalButton((open) => (
            <InternalButton onClick={open}>
              {t("Add an address")}
            </InternalButton>
          ))}
        </Empty>
      ) : (
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
                onClick={() => onClick(item)}
                onDelete={() => remove(name)}
                key={name}
              />
            )
          })}
        </Grid>
      )}
    </Card>
  )
}

export default AddressBookList
