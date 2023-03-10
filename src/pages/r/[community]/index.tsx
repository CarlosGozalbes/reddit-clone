import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { firestore } from "../../../firebase/clientApp";
import safeJsonStringify from "safe-json-stringify";
import CommunityNotFound from "../../../components/Community/CommunityNotFound";
import Header from "../../../components/Community/Header";
import PageContent from "../../../components/Layout/PageContent";
import CreateCommunityModal from "../../../components/Modal/CreateCommunity/CreateCommunityModal";
import CreatePostLink from "../../../components/Community/CreatePostLink";
import Posts from "../../../components/Posts/Posts";
import { useSetRecoilState } from "recoil";
import About from "../../../components/Community/About";

interface CommunityPageProps {
  communityData: Community;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  
  const setCommunityStateValue = useSetRecoilState(communityState)

  
  useEffect(() => {
    setCommunityStateValue(prev =>({
      ...prev,
      currentCommunity: communityData
    }))
  }, [communityData])
  
  if (!communityData.createdAt) {
    return <CommunityNotFound />;
  } 

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  );
};

export default CommunityPage;
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const communityDocRef = doc(
    firestore,
    "communities",
    context.query.community as string
  );

  const communityDoc = await getDoc(communityDocRef);
  console.log("communityDoc", communityDoc);
  if (!communityDoc.exists) {
    return { 
      props: {
        communityData: null,
      }
    };
  }
  const communityData = JSON.parse(safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })) 
  console.log("comunityData",communityData)
  return {
    props: {
      communityData,
    },
  };

  /* console.log("GET SERVER SIDE PROPS RUNNING");

  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.community as string
    );
    const communityDoc = await getDoc(communityDocRef);
    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() }) // needed for dates
            )
          : "",
      },
    };
  } catch (error) {
    // Could create error page here
    console.log("getServerSideProps error - [community]", error);
  }
  return {
    props: {},
  }; */
}
