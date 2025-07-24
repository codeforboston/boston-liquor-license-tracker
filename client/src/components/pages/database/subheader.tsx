import styles from "./subheader.module.css";

const SubHeader = () => {
  return (
    <section className={styles.subheader}>
      <h2 className={styles.heading}>License Availability Lookup:</h2>
      <p className={styles.description}>
        Select a Zip Code below to see the available licenses in each area. Use the filters narrow or expand your search to meet your exact business needs
      </p>
    </section>
  );
};

export default SubHeader;
