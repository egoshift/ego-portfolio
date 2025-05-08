import { useWindowContext } from "../../contexts/Window.context";
import { WindowEnum } from "../../enums/Windows.enum";
import DockBar from "./DockBar";
import DraggableArea from "./DraggableArea";
import TopBar from "./TopBar";
import AboutWindow from "./Windows/AboutWindow";
import CertificationWindow from "./Windows/CertificationWindow";
import ExperienceWindow from "./Windows/ExperienceWindow";

export default function AppV1() {
  const windowContext = useWindowContext();
  const { openedWindows } = windowContext;
  
  return (
    <>
      <TopBar />
      <DraggableArea>
        <AboutWindow isOpen={openedWindows.includes(WindowEnum.ABOUT)} window={WindowEnum.ABOUT} />
        <CertificationWindow isOpen={openedWindows.includes(WindowEnum.CERTIFICATIONS)} window={WindowEnum.CERTIFICATIONS} />
        <ExperienceWindow isOpen={openedWindows.includes(WindowEnum.EXPERIENCE)} window={WindowEnum.EXPERIENCE} />
      </DraggableArea>
      <DockBar />
    </>
  )
}