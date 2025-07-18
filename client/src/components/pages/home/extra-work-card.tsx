import { ExtraWork } from "@/data/extra-work-data"

interface ExtraWorkCardProps {
  item: ExtraWork
}


const ExtraWorkCard = ({ item }: ExtraWorkCardProps) => {
  return (
    <a
      href={item.href}
      target="_blank"
      className={`
                flex
                items-end
                shrink-0
                size-[320px]
                p-[16px]
                rounded-[8px]
                bg-cover
                bg-center
                bg-no-repeat
                cursor-pointer
            `}
      style={{ backgroundImage: `url(${item.imgSrc})` }}
    >
      <p className={`text-[24px] text-shadow-lg font-semibold ${item.textColor === "light" ? "text-black" : "text-white"}`}>
        {item.title}
      </p>
    </a>
  )
}

export default ExtraWorkCard
