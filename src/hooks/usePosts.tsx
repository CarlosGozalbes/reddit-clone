import React from 'react';
import { useRecoilState } from 'recoil';
import { postState } from '../atoms/postAtom';


const useHooks= () => {
    
    const [postStateValue,setPostStateValue] = useRecoilState(postState)
    const onVote = async()=> {}
    const onSelectPost =  () => {};
    const onDeletePost = async () => {};

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost
    }
}
export default useHooks;