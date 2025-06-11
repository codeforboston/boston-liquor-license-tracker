
interface RecentApplicationCardPropsType {
    applicationData: {
        dbaName: string
        businessName: string;
        address: string;
        licenseNumber: string;
        licenseType: string;
        applicationDate: string;
    }
}

const RecentApplicationCard = ({applicationData}: RecentApplicationCardPropsType) => {
    return (
        <article className="
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
            
        </article>
    )
}

export default RecentApplicationCard
