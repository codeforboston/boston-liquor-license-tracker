import "./pageheader.css";

export const PageHeader = ({
  headerTitle,
  headerText,
  children,
  showBottomBoxShadow = false,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
  showBottomBoxShadow?: boolean;
}) => {
  return (
    <header className={`pageheader ${showBottomBoxShadow && "boxshadow"}`}>
      <div className="text-container">
        <h1 className="header-title">{headerTitle}</h1>
        <p className="header-text max-w-3xl">{headerText}</p>
        <div className="header-children">{children}</div>
      </div>
    </header>
  );
};

export default PageHeader;
