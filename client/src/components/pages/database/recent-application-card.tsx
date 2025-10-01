import statusApprovedIcon from "@/assets/status-approved.svg"
import statusPendingIcon from "@/assets/status-pending.svg"
import statusDeniedIcon from "@/assets/status-denied.svg"


interface RecentApplicationCardProps {
    dbaName: string
    businessName: string;
    address: string;
    licenseNumber: string;
    licenseType: string;
    applicationDate: string;
    status: "approved" | "pending" | "denied" 
}

const statusIconMap = {
    approved: {icon: statusApprovedIcon, bgColor: "bg-license-accepted-green"},
    pending: {icon: statusPendingIcon, bgColor: "bg-license-deferred-yellow"},
    denied: {icon: statusDeniedIcon, bgColor: "bg-license-expired-red"},
}

const RecentApplicationCard = ({businessName, dbaName, address, licenseNumber, licenseType, applicationDate, status}: RecentApplicationCardProps) => {
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
            bg-ui-gray 
            text-font-dark
            rounded-[8px] 
            shadow-[2px_2px_4px_0px_rgba(0,0,0,0.25)]"
        >
            <header className=" font-bold">
                <h5 className="text-[12px] font-semibold">{businessName}</h5>
            </header>
            <div className="flex flex-col gap-y-[4px] text-[10px] font-font-light italic">
                <p>{dbaName}</p>
                <p>{address}</p>
                <p>{licenseNumber}</p>
                <p>{licenseType}</p>
                <p>{applicationDate}</p>
            </div>
            <img 
                src={statusIconMap[status].icon} 
                alt={`status ${status} icon`} 
                className={`absolute shrink-0 top-[8px] right-[8px] size-[18px] p-[2px] rounded-full ${statusIconMap[status].bgColor}`}
            />
        </article>
    )
}

export default RecentApplicationCard
