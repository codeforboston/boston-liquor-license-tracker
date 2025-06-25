import statusApprovedIcon from "@/assets/status-approved.svg"
import statusPendingIcon from "@/assets/status-pending.svg"
import statusDeniedIcon from "@/assets/status-denied.svg"

interface ApplicationData {
    dbaName: string
    businessName: string;
    address: string;
    licenseNumber: string;
    licenseType: string;
    applicationDate: string;
    status: "approved" | "pending" | "denied" // not sure how the statuses come through from the DB
}

interface RecentApplicationCardProps {
    applicationData: ApplicationData
}

/* For Testing */
const dummyData: ApplicationData = {
    businessName: "Business Name",
    dbaName: "Dba Name",
    address: "Street Address, Neighborhood, MA ZIP Code",
    licenseNumber: "License Number",
    licenseType: "License Type",    
    applicationDate: "App. Date",
    status: "pending"
} 

const statusIconMap = {
    approved: {icon: statusApprovedIcon, bgColor: "bg-[#46C800]"},
    pending: {icon: statusPendingIcon, bgColor: "bg-[#FFF714]"},
    denied: {icon: statusDeniedIcon, bgColor: "bg-[#FF1111]"},
}

const RecentApplicationCard = ({applicationData=dummyData}: RecentApplicationCardProps) => {
    return (
        <article className="
            relative
            flex
            flex-col
            gap-y-[4px]
            shrink-0     
            w-[224px] 
            h-[110px]
            box-content
            px-[16px]
            py-[8px]
            bg-[#f2f2f2] 
            text-[#2E2E2E]
            rounded-[8px] 
            shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]"
        >
            <header className=" font-bold">
                <h5 className="text-[12px] font-semibold">{applicationData.businessName}</h5>
            </header>
            <div className="flex flex-col gap-y-[4px] text-[10px] font-light italic">
                <p>{applicationData.dbaName}</p>
                <p>{applicationData.address}</p>
                <p>{applicationData.licenseNumber}</p>
                <p>{applicationData.licenseType}</p>
                <p>{applicationData.applicationDate}</p>
            </div>
            <img 
                src={statusIconMap[applicationData.status].icon} 
                alt={`status ${applicationData.status} icon`} 
                className={`absolute shrink-0 top-[8px] right-[8px] size-[18px] p-[2px] rounded-full ${statusIconMap[applicationData.status].bgColor}`}
            />
        </article>
    )
}

export default RecentApplicationCard
