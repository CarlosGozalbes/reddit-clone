import { Alert, AlertDescription, AlertIcon, AlertTitle, Flex, Icon,Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import { BiPoll } from "react-icons/bi";
import TabItemComp from "./TabItemComp";
import TextInputs from "./PostForm/TextInputs";
import ImageUpload from "./PostForm/ImageUpload";
import { Post } from "../../atoms/postAtom";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { addDoc, collection, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useSelectectFile from "../../hooks/useSelectectFile";

type NewPostFormProps = {
  user:User ;
  communityImageURL?: string
};

const formTabs: TabItem[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
];
export type TabItem = {
  title: string;
  icon: typeof Icon.arguments;
};

const NewPostForm: React.FC<NewPostFormProps> = ({user, communityImageURL}) => {
  const router  =useRouter();
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title);
  const [textInputs, setTextInputs] = useState({
    title: '',
    body: '',
  });
 // const [selectedFile, setSelectedFile] = useState<string>();
 const {selectedFile,setSelectedFile,onSelectFile} = useSelectectFile()
  const [loading,setLoading] =  useState(false)
  const [error,setError] = useState(false)
  const handleCreatePost = async () => {
    const {community} = router.query
    //create new post object type post
    
    const newPost : Post = {
      communityId: community as string,
      communityImageURL:communityImageURL || '',
      creatorId: user.uid,
      creatorDisplayName: user.email!.split("@")[0],
      title : textInputs.title,
      body:textInputs.body,
      numberOfComments:0,
      voteStatus:0,
      createdAt: serverTimestamp() as Timestamp
    }
    setLoading(true)
    try {
      //store post in db
      const postDocRef = await addDoc(collection(firestore, "posts"), newPost);
      //cehck and see if image
      //store it in firebase storage =>getdowndloadurl(return image url)
      if (selectedFile) {
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);
        //update post doc adding image url
        await updateDoc(postDocRef, {
          imageURL: downloadURL,
        });
      }
      //redirect the user back to the communityPage using router
      router.back();
    } catch (error: any) {
      console.log("handleCreatePost error", error.message)
      setError(true)
    }
    setLoading(false);
    
    
  };
 /*  const onSelectImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const reader= new FileReader()
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
    reader.onload =(readerEvent)=> {
      if(readerEvent.target?.result) {
        setSelectedFile(readerEvent.target.result as string)
      }
    }
    
  }; */
  const onTextChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {target:{name,value}} =event
    setTextInputs(prev =>({...prev, [name]:value}))
  };

  return (
    <Flex direction="column" bg="white" borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          <TabItemComp
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex padding={4}>
        {selectedTab === "Post" && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === "Images & Video" && (
          <ImageUpload
            selectedFile={selectedFile}
            onSelectImage={onSelectFile}
            setSelectedTab={setSelectedTab}
            setSelectedFile={setSelectedFile}
          />
        )}
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2}>Error creating post</Text>
          
        </Alert>
      )}
    </Flex>
  );
};
export default NewPostForm;
