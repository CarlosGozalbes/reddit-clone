import { Stack } from "@chakra-ui/react";
import { collection, Firestore, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { NextPage } from "next";
import { MouseEvent, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import { Post } from "../atoms/postAtom";
import CreatePostLink from "../components/Community/CreatePostLink";
import PageContent from "../components/Layout/PageContent";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import usePosts from "../hooks/usePosts";

const index: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const communityStateValue = useRecoilValue(communityState);
  const {setPostStateValue, postStateValue,onSelectPost,onDeletePost,onVote} = usePosts()
  const buildUserHomeFeed = () => {};
  const buildNoUserHomeFeed = async () => {
    setLoading(true);
    try {
      const postQuery = query(collection(firestore,"posts"),orderBy("voteStatus","desc"), limit(10))
      const postDocs = await getDocs(postQuery)
      const posts = postDocs.docs.map(doc =>({id:doc.id,...doc.data()}))

      setPostStateValue(prev=>({
        ...prev,
        posts:posts as Post[]
      }))
    } catch (error) {
      console.log("buildNoUserHomeFeed error",error);
      
    }
    setLoading(false)
  };
  const getUserPostVotes = () => {};

  useEffect(() => {
    if (!user && !loadingUser) {
      buildNoUserHomeFeed();
    }
  }, [user, loadingUser]);

  return (
    <PageContent>
      <>
      <CreatePostLink/>
      {loading ? (<PostLoader/>): (
        <Stack>
          {postStateValue.posts.map(post=>(
            <PostItem key={post.id} post={post} onSelectPost={onSelectPost} onDeletePost={onDeletePost} onVote={onVote} userVoteValue={postStateValue.postVotes.find(
              (item)=>item.postId ===post.id)?.voteValue} userIsCreator={user?.uid===post.creatorId} homePage />
          ))}
        </Stack>
      )}
      </>
      <></>
    </PageContent>
  );
};
export default index;
