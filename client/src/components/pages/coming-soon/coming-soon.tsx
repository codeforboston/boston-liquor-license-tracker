import PageHeader from "@components/pages/coming-soon/pageheader.tsx";
import BackToHome from "@components/ui/back-to-home/back-to-home.tsx";
import { FormattedMessage } from "react-intl";
import "./coming-soon.css";

const ComingSoon = () => {
  return (
    <main className="coming-soon-page">
      <PageHeader
        headerTitle={<FormattedMessage id="comingSoon.title" />}
        headerText={<FormattedMessage id="comingSoon.description" />}
      >
        <BackToHome />
      </PageHeader>
    </main>
  );
};

export default ComingSoon;
