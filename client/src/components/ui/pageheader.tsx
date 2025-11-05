import "./pageheader.css";

export const HeaderCard = ({
  headerTitle,
  headerText,
  children,
  showBottomBoxShadow = false,
  cardStyle = false,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
  showBottomBoxShadow?: boolean;
  cardStyle?: boolean;
}) => {
  const classes = [
    "pageheader",
    showBottomBoxShadow && "boxshadow",
    cardStyle && "card-style",
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

// Keep PageHeader as an alias for backward compatibility
export const PageHeader = HeaderCard;

export default HeaderCard;
