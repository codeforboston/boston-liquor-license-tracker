import { ReactNode, useState } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab: string;
};

function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="w-full">
      <nav className="flex bg-(--color-gray-dark-3) rounded-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-1 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border border-[var(--color-border-gray)] bg-[var(--color-white-1)] rounded-sm"
                : "text-[var(--color-white-1)] border-transparent hover:text-(--color-button-hovered-light) hover:font-bold hover:cursor-pointer rounded-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {/* </div> */}

      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

export default Tabs;
