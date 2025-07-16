import "./pageheader.css";

const PageHeader = ({
  headerTitle,
  headerText,
  children,
}: {
  headerTitle: React.ReactNode;
  headerText: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <header className="pageheader">
      <div className="text-container">
        <h1 className="header-title">{headerTitle}</h1>
        <p className="header-text">{headerText}</p>
        <div className="header-children">{children}</div>
      </div>
    </header>
  );
};

export default PageHeader;
