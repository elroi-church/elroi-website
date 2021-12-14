import { FunctionComponent, ReactNode } from "react";
import Navbar from "../nav/navbar";
import NavFooter from "../nav/NavFooter";

const MainLayout: FunctionComponent<ReactNode> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        {children}
        {/* <div className="main-layout__content">{children}</div> */}
      </div>
      <NavFooter />
    </>
  );
};

export default MainLayout;
