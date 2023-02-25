import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React from "react";
import { Community } from "../../../atoms/communitiesAtom";
import { firestore } from "../../../firebase/clientApp";
import safeJsonStringify from "safe-json-stringify";
import CommunityNotFound from "../../../components/Community/CommunityNotFound";
import Header from "../../../components/Community/Header";
import PageContent from "../../../components/Layout/PageContent";

type CommunityPageProps = {
  communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  
  if (!communityData.numberOfMembers) {
    return <CommunityNotFound />;
  }  
  return (
  <>
  <Header communityData={communityData}/>
  <PageContent>
    <><div>LHS</div></>
    <><div>RHS</div></>
  </PageContent>
  </>
  );
};

export default CommunityPage;
export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    //get community data and pass it to client
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);
    
    return {
      props: {
        communityData: JSON.parse(
          safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
        ),
      },
    };
  } catch (error) {
    //could add error page
    console.log("getServerSideProps error", error);
    /* return {
      redirect: {
        destination: "/",
        statusCode: 307,
      },
    } */
    };
  
}

