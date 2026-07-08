import { FormattedMessage } from "react-intl";
import { PageHeader } from "@/components/ui/pageheader";

const Header = () => {
  return (
    <header>
      <PageHeader
        headerTitle={<FormattedMessage id="resources.pageTitle" />}
        headerText={<FormattedMessage id="resources.header.description" />}
      />
    </header>
  );
};

export default Header;