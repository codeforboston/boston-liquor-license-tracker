import "./header-card.css";

export const HeaderCard = ({
  headerTitle,
  headerText,
  children,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const classes = [
    "pageheader",
    "boxshadow",
    "card-style",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes}>
      <div className="text-container">
        <h1 className="header-title">{headerTitle}</h1>
        <p className="header-text max-w-3xl">{headerText}</p>
        <div className="header-children">{children}</div>
      </div>
    </header>
  );
};

export default HeaderCard;
