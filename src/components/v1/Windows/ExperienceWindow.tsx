import { LockClosedIcon } from "@heroicons/react/24/solid";
import DraggableWindow, { DraggableWindowProps } from "../DraggableWindow";
import { Professional, Techs } from "../../../constants/experiences.constants";
import { cx } from "../../../utils/cx";
import { useState } from "react";
import { WindowEnum } from "../../../enums/Windows.enum";

interface Props extends DraggableWindowProps {}

export default function ExperienceWindow(props: Props) {
  const [selectedItem, setSelectedItem] = useState<number>(0);

  return (
    <DraggableWindow {...props} windowClassName="w-4xl h-160" window={WindowEnum.EXPERIENCE}>
      <div className="backdrop-blur-2xl grid grid-cols-3 h-full w-full">
        <div className="bg-gray-200/50 pt-14 px-4 shadow">
          <div className="flex items-center space-x-4">
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden shadow-xl">
              <img src="me-programmer.png" alt="" />
            </div>
            <div>
              <p className="text-xs font-semibold">Ems Oriel</p>
              <p className="text-xs text-gray-500">Full-stack Developer</p>
            </div>
          </div>
          <div>
            <div className="mt-8 mb-2">
              <p className="text-xs text-gray-400 font-semibold">Professional</p>
            </div>
            <div className="">
              {Professional.map((e, index) => (
                <p className={cx(
                  "text-xs font-semibold px-3 py-2 truncate rounded-lg",
                  selectedItem === index ? "bg-blue-400 text-white" : ""
                )} onClick={() => setSelectedItem(index)}>{e.name}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-2 relative pt-14 px-8 pb-8 overflow-y-auto">
          {Professional.map((e, index) => (
            <div className={cx("space-y-4", selectedItem === index ? "" : "hidden")}>
              <div className="border border-gray-300 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{e.name}</p>
                    <p className="text-sm text-gray-500">{e.role}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{e.timeline}</p>
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded-lg">
                <div className="flex flex-col justify-between space-y-1">
                  <p className="text-xs text-gray-500 font-bold">Common Tech Stack</p>
                  <div className="flex space-x-1">
                    {e.techstack.map((t: string) => (
                      <img src={Techs[t]?.logo || ''} className="size-[25px] bg-white border-[0.5px] border-gray-200 shadow p-1 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded-lg">
                <div className="flex flex-col text-xs space-y-1">
                  <p className="text-xs text-gray-500 font-bold">Roles & Responsibilities</p>
                  <ul className="space-y-2 divide-y divide-gray-300">
                    {e.responsibilites.map(i => (
                      <li className="pb-4 pt-2 flex items-start space-x-2">
                        <span>🟢</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border border-gray-300 p-4 rounded-lg">
                <div className="flex flex-col text-xs space-y-1">
                  <p className="text-xs text-gray-500 font-bold">Notable Projects</p>
                  <ul className="space-y-2 divide-y divide-gray-300">
                    {e.projects?.map(p => (
                      <li className="pb-4 pt-2 space-x-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold">{p.title}</span>
                          {p.isNDA && <span className="flex items-center space-x-1 bg-yellow-600 text-white py-0.5 px-1 rounded-full">
                            <LockClosedIcon className="size-[10px]" />
                            <span className="font-semibold">NDA</span>
                          </span>}
                        </div>
                        <div className="my-2">{p.description}</div>
                        <div className="flex -space-x-2">
                          {p.techstack.map((t: string) => (
                            <img src={Techs[t].logo} className="size-[25px] bg-white border-[0.5px] border-gray-200 shadow p-1 rounded-lg object-contain" />
                          ))}
                        </div>
                      </li>
                    ))}
                    
                  </ul>
                </div>
          </div>
            </div>
          ))}
        </div>
      </div>
    </DraggableWindow>
  )
}