import { ExtraWork } from "@/data/extra-work-data"

interface ExtraWorkCardProps {
  item: ExtraWork
}


const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  return (
    <div className="shrink-0 size-[320px] rounded-[9px] bg-black  ">
      <a
        href={item.href}
        target="_blank"
        className={`
                  flex
                  items-end
                  size-full
                  p-[16px]
                  rounded-[8px]
                  bg-cover
                  bg-center
                  bg-no-repeat
                  cursor-pointer
                  hover:opacity-90
                  active:opacity-70
              `}
        style={{ backgroundImage: `url(${item.imgSrc})` }}
      >
        <p className={`text-[24px] text-shadow-lg font-semibold ${item.textColor === "light" ? "text-black" : "text-white"}`}>
          {item.title}
        </p>
      </a>
    </div>
  )
}

export default ExtraWorkCard
