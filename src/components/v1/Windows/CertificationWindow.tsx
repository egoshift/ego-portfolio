import { useState } from "react";
import DraggableWindow, { DraggableWindowProps } from "../DraggableWindow";
import { cx } from "../../../utils/cx";
import { WindowEnum } from "../../../enums/Windows.enum";

interface Props extends DraggableWindowProps {}
interface TabType {
  tabTitle: string;
  tabSubtitle: string;
  certificateTitle: string;
  issuer: string;
  issued: string;
  logo?: string;
  certificateLink?: string;
  certificateText?: string;
}

const Tabs: TabType[] = [
  {
    tabTitle: 'EDPS - Electronic Data Processing Specialist',
    tabSubtitle: "Issued: Jan 31, 2019",
    certificateTitle: "Electronic Data Processing Specialist",
    issuer: "Department of Information and Communications Technology",
    issued: "Issued: Jan 31, 2019 - Philippines",
    logo: "/dict.svg"
  },
  {
    tabTitle: 'NC II - Computer Systems Servicing',
    tabSubtitle: "Validity: 2019 - 2024",
    certificateTitle: "NC II - Computer Systems Servicing",
    issuer: "Technical Education and Skills Development Authority",
    issued: "Validity: 2019 - 2024",
    logo: "/tesda.svg"
  }
]

export default function CertificationWindow(props: Props) {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleTabClick = (index: number) => setSelectedTab(index);

  return (
    <DraggableWindow {...props} windowClassName="w-2xl h-128" window={WindowEnum.CERTIFICATIONS}>
      <div className="grid grid-cols-3 h-full w-full">
        <div
          className="bg-gray-50/5 pt-14 px-4 border-r border-gray-100 shadow"
          style={{
            boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {Tabs.map((tab, index) => (
            <div
              className={cx(
                "p-4 rounded-lg cursor-pointer",
                index === selectedTab ? "bg-blue-400" : "hover:bg-gray-200/20"
              )}
              onClick={() => handleTabClick(index)}
            >
              <p className={cx(
                "text-xs font-semibold truncate",
                index === selectedTab ? 'text-white' : ''
              )}>{tab.tabTitle}</p>
              <p className={cx(
                "text-xs ",
                index === selectedTab ? 'text-white/80' : 'text-gray-500'
              )}>{tab.tabSubtitle}</p>
            </div>
          ))}
        </div>
        <div className="bg-blue-400 col-span-2 relative">
          <div
            className="absolute top-0 h-[150px] w-full"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255, 255, 255, 0) 1%, rgba(80, 162, 255, 1)),
                url('/confetti.gif')
              `,
              backgroundSize: '60%',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
            }}
          />
          {Tabs.map((tab, index) => (
            <div className={cx(
              "relative flex flex-col items-center justify-center mt-12 z-1",
              index === selectedTab ? '' : 'hidden'
            )}>
              <img src={tab.logo} className="w-25 mb-12" />
              <p className="font-bold text-white">{tab.certificateTitle}</p>
              <p className="text-xs font-semibold text-white">{tab.issuer}</p>
              <p className="text-xs font-semibold italic text-white mt-4">{tab.issued}</p>
            </div>
          ))}
          
        </div>
      </div>
    </DraggableWindow>
  )
}