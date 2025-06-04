import "./application-card.css";

type ApplicationCardProps = {
  businessName: string;
  DbaName: string;
  address: string;
  licenseNumber: string;
  licenseType: string;
  applicationDate: string;
  applicationStatus: string;
}

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
