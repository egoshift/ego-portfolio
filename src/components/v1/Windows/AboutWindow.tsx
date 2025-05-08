import { useEffect, useState } from "react";
import DraggableWindow, { DraggableWindowProps } from "../DraggableWindow";
import { WindowEnum } from "../../../enums/Windows.enum";

interface Props extends DraggableWindowProps {}

const images = [
  "me-programmer.png",
  "me-hiker.png",
  "me-photographer.png",
  "me-artist.png",
]

export default function AboutWindow(props: Props) {
  const [selectedImage, setSelectedImage] = useState<number>(0);

  useEffect(() => {
    const imageIndex = Math.floor(Math.random() * images.length);
    setSelectedImage(imageIndex);
  }, [])

  return (
    <DraggableWindow {...props} windowClassName="w-[300px]" window={WindowEnum.ABOUT}>
      <div className="p-6 mt-6">
        <div className="rounded-full overflow-hidden my-2 mx-2 shadow-xl">
          <img src={images[selectedImage]} alt="" />
        </div>
        <ul className="flex justify-center space-x-1 text-sm">
          <li className="p-1 rounded-lg border border-transparent hover:border-gray-200/50" onClick={() => setSelectedImage(0)}>💻</li>
          <li className="p-1 rounded-lg border border-transparent hover:border-gray-200/50" onClick={() => setSelectedImage(1)}>🏔️</li>
          <li className="p-1 rounded-lg border border-transparent hover:border-gray-200/50" onClick={() => setSelectedImage(2)}>📷</li>
          <li className="p-1 rounded-lg border border-transparent hover:border-gray-200/50" onClick={() => setSelectedImage(3)}>🎨</li>
        </ul>
        <div className="text-center">
          <p className="text-3xl font-semibold text-gray-800 mt-4 mb-0">Ems Oriel</p>
          <p className="font-semibold text-gray-500 text-xs">Full-stack Developer</p>
          <p className="text-gray-500 text-xs">Cebu City, Philippines 🇵🇭</p>
          
          <div className="my-8 px-4">
            <p className="text-gray-800 text-xs">
              <mark>Versatile</mark> development skills <mark>encompassing</mark> full-stack applications, creative coding, and game development. Builds <mark>dynamic and engaging</mark> digital experiences with a <mark>strong design sensibility</mark>.
            </p>
          </div>
          <button className="bg-gray-500/20 text-gray-900 text-xs py-1 px-2 rounded-md mb-2 active:bg-gray-500/40">Resume</button>
          <p className="text-gray-500 text-xs">v1.0.0</p>
        </div>
      </div>
    </DraggableWindow>
  )
}