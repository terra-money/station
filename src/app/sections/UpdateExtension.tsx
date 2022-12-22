import classNames from "classnames"
import { EXTENSION } from "config/constants"
import styles from "./UpdateExtension.module.scss"

const UpdateExtension = () => {
  if (window.isTerraExtensionAvailable && !window.isStationExtensionAvailable)
    return (
      <div className={classNames(styles.text, styles.info)}>
        Please{" "}
        <a href={EXTENSION} target="_blank" rel="noreferrer">
          update
        </a>{" "}
        your version of Station Extension.
      </div>
    )

  return null
}

export default UpdateExtension
