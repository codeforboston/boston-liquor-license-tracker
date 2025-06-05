import "./application-card.css";

type ApplicationCardProps = {
  businessName: string;
  dbaName: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  applicationDate: string;
  applicationStatus: string;
}

// Remove this comment when implementing the component
// @ts-expect-error - scaffolding: props defined but not yet implemented
const ApplicationCard = ({
  businessName,
  dbaName,
  address,
  licenseNumber,
  licenseType,
  applicationDate,
  applicationStatus
}: ApplicationCardProps) => {
  return (
    <article className="application-card">
    </article>
  )
}

export default ApplicationCard;
