import { getDocs, collection, writeBatch, doc, increment } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

const useCommunityData = () => {
  const [user] = useAuthState(auth);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
const setAuthModalState = useSetRecoilState(authModalState)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    //is the user signed in
    //if not open auth modal
    if(!user) {
        //openmodal
        setAuthModalState({open:true,view:"login"})
        return 
    }

    setLoading(true);
    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };
  const getMySnippets = async () => {
    setLoading(true);
    try {
      //getuser snippets
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      console.log("here are snippets", snippets);
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }));
    } catch (error: any) {
      console.log("getMySnippets error", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const joinCommunity = async (communityData: Community) => {
    //batch write
    // creating a new community snippet
    //updating the numberofmembers +1
    
    try {
      const batch = writeBatch(firestore);
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || "",
      };
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );
      batch.update(doc(firestore,"communities",communityData.id),{
        numberOfMembers: increment(1),
      })
      await batch.commit()
      //update recoil state
      setCommunityStateValue(prev => ({
        ...prev,
        mySnippets:[...prev.mySnippets,newSnippet]
      }))
    } catch (error: any) {
      console.log("joincommunity error", error);
      setError(error.message);
    }
    setLoading(false)
    
  };
  const leaveCommunity = async (communityId: string) => {
    //batch write
    // creating a new community snippet
    //updating the numberofmembers -1
    
    
    try {
      const batch = writeBatch(firestore);
     
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId),
    
      );
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });
      await batch.commit();
      //update recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter((item) => item.communityId !== communityId),
      }));
    } catch (error: any) {
      console.log("joincommunity error", error);
      setError(error.message);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev)=>({
        ...prev,
        mySnippets:[]
      }))
      return 
    };
    getMySnippets();
  }, [user]);

  return {
    //data and fucntions
    communityStateValue,

    onJoinOrLeaveCommunity,
    loading,
  };
};
export default useCommunityData;
