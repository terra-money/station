import { useTranslation } from "react-i18next"
import AddIcon from "@mui/icons-material/Add"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { truncate } from "@terra.kitchen/utils"
import { RenderButton } from "types/components"
import { useAddressBook } from "data/settings/AddressBook"
import { InternalButton } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import { Empty, ModalButton, Mode } from "components/feedback"
import AddAddressBookItem from "./AddAddressBookItem"
import ListAddressBookItem from "./ListAddressBookItem"
import CustomItem from "./CustomItem"
import is from "auth/scripts/is"
import styles from "./AddressBookList.module.scss"

interface Props {
  onClick: (item: AddressBook) => void
}

const AddressBookList = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const { list, remove } = useAddressBook()

  const renderAddModalButton = (renderButton: RenderButton) => (
    <ModalButton
      title={t("Add a new address")}
      renderButton={renderButton}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
    >
      <AddAddressBookItem />
    </ModalButton>
  )

  const renderListModalButton = (renderButton: RenderButton) => (
    <ModalButton
      title={t("Manage List")}
      renderButton={renderButton}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
      subAction={() =>
        renderAddModalButton((open) => (
          <button type="button" onClick={open}>
            <AddIcon />
          </button>
        ))
      }
    >
      <ListAddressBookItem onClick={onClick} />
    </ModalButton>
  )

  const renderList = () =>
    !list.length ? (
      <Empty icon={<PersonAddOutlinedIcon fontSize="inherit" />}>
        {renderAddModalButton((open) => (
          <InternalButton onClick={open}>{t("Add an address")}</InternalButton>
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
              onClick={() => {
                onClick(item)
              }}
              onDelete={() => remove(name)}
              key={name}
            />
          )
        })}
      </Grid>
    )

  return is.mobile() ? (
    renderListModalButton((open) => (
      <button type="button" onClick={open} className={styles.button}>
        <Flex className={styles.between}>
          <span>{t("Address book")}</span>
          <ArrowForwardIosIcon style={{ fontSize: 12 }} />
        </Flex>
      </button>
    ))
  ) : (
    <Card
      title={t("Address book")}
      extra={renderAddModalButton((open) => (
        <button type="button" onClick={open}>
          <AddIcon />
        </button>
      ))}
    >
      {renderList()}
    </Card>
  )
}

export default AddressBookList
