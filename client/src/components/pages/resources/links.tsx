import { FormattedMessage } from "react-intl";

const Links = () => {
  return (
    <div>
      <div>
        <h2>
          <FormattedMessage id="resources.links.title" />
        </h2>
        <p>
          <FormattedMessage id="resources.links.description" />
        </p>
      </div>

      {/* Alcohol License Petition Form */}
      <div>
        <h3>
          <FormattedMessage id="resources.links.alcoholLicensePetitionFormTitle" />
        </h3>

        <p>
          <FormattedMessage id="resources.links.alcoholLicensePetitionFormDescription" />
        </p>

        <p>
          <FormattedMessage id="resources.links.alcoholLicensePetitionFormNote" />
        </p>

        <button
          onClick={() =>
            alert("Redirecting to the Alcohol License Petition Form...")
          }
        >
          <FormattedMessage id="resources.links.alcoholLicensePetitionFormButton" />
        </button>
      </div>

      {/* ABCC Application */}
      <div>
        <h3>
          <FormattedMessage id="resources.links.abccApplicationTitle" />
        </h3>
        <p>
          <FormattedMessage id="resources.links.abccApplicationDescription" />
        </p>
        <button onClick={() => alert("Redirecting to the ABCC Application...")}>
          <FormattedMessage id="resources.links.abccApplicationButton" />
        </button>
      </div>
    </div>
  );
};

export default Links;
