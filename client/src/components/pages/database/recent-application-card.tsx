import statusApprovedIcon from "@/assets/status-approved.svg"
import statusPendingIcon from "@/assets/status-pending.svg"
import statusDeniedIcon from "@/assets/status-denied.svg"

interface RecentApplicationCardPropsType {
    applicationData: {
        dbaName: string
        businessName: string;
        address: string;
        licenseNumber: string;
        licenseType: string;
        applicationDate: string;
        status: "approved" | "pending" | "denied"
    }
}

/* For Testing */
const dummyData = {
    businessName: "Business Name",
    dbaName: "Dba Name",
    address: "Street Address, Neighborhood, MA ZIP Code",
    licenseNumber: "License Number",
    licenseType: "License Type",    
    applicationDate: "App. Date",
    status: "denied"
}

const statusIconMap = {
    approved: {icon: statusApprovedIcon, bgColor: "bg-[#46C800]"},
    pending: {icon: statusPendingIcon, bgColor: "bg-[#FFF714]"},
    denied: {icon: statusDeniedIcon, bgColor: "bg-[#FF1111]"},
}

const RecentApplicationCard = ({applicationData=dummyData}: RecentApplicationCardPropsType) => {
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
            rounded-[8px] 
            shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]"
        >
            <header className=" font-bold">
                <h5 className="text-[14px] leading-[14px]">{applicationData.businessName}</h5>
            </header>
            <div className="flex flex-col gap-y-[4px] text-[12px] leading-[12px] font-normal italic">
                <p>{applicationData.dbaName}</p>
                <p>{applicationData.address}</p>
                <p>{applicationData.licenseNumber}</p>
                <p>{applicationData.licenseType}</p>
                <p>{applicationData.applicationDate}</p>
            </div>
            <img 
                src={statusIconMap[applicationData.status].icon} 
                alt={`status ${applicationData.status} icon`} 
                className={`absolute top-[8px] right-[8px] size-[18px] p-[2px] rounded-full ${statusIconMap[applicationData.status].bgColor}`}
            />
        </article>
    )
}

export default RecentApplicationCard
