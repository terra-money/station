import styles from "./PageBanner.module.scss"

const PageBanner = ({
  title,
  buttonHref,
}: {
  title: string
  buttonHref: string
}) => {
  return (
    <div className={styles.page__banner__container}>
      <h4>{title}</h4>
      <a
        className={styles.button}
        href={buttonHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn More
      </a>
    </div>
  )
}

export default PageBanner
