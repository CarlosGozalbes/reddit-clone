import { Flex } from "@chakra-ui/react";
import React from "react";
import { authModalState } from "../../../atoms/authModalAtom";
import { useRecoilValue } from "recoil";
import Login from "./Login";
import SignUp from "./SignUp";

type AuthinputsProps = {};

const Authinputs: React.FC<AuthinputsProps> = () => {
  const modalState = useRecoilValue(authModalState);
  return (
    <Flex direction="column" align="center" width="100%" mt={4}>
      {modalState.view === "signup" && <SignUp />}
      {modalState.view === "login" && <Login />}
    </Flex>
  );
};
export default Authinputs;
