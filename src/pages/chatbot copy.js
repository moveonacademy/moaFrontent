import { useEffect, useCallback, useState } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import Button from '@mui/material/Button';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from "@chatscope/chat-ui-kit-react";
import Speech from 'react-text-to-speech';
import MicNoneIcon from '@mui/icons-material/MicNone';
import { useMoralis } from 'react-moralis';
import { useWhisper } from '@chengsokdara/use-whisper'
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { AudioRecorder, useAudioRecorder, } from 'react-audio-voice-recorder';
import { async } from 'react-cloudinary-upload-widget';
import OpenAI from 'openai';
import { CircularProgress, Avatar,Stack, Typography } from '@mui/material';
const openai = new OpenAI({ apiKey:process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true })
import user from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { SayButton } from 'react-say';

import { eld } from 'eld' // use .mjs extension for version <18


const Chatbot = () => {
  const [isLoading2, setLoading2] = useState(false);
  const [isLoadingAudio, setLoadingAudio] = useState(false);
  


  async function handleSpeaker() {
    setLoading2(true);
  }

  async function handleStopSpeaker() {
    setLoading2(false);
  }

  const startBtn = !isLoading2 ? <VolumeMuteIcon onClick={handleSpeaker} /> : null;
  const pauseBtn = isLoading2 ? <VolumeUpIcon onClick={handleStopSpeaker} /> : null;
  const stopBtn = null;

  const [history, setHistory] = useState([
    {
      role: "assistant",
      content: "Bienvenido al chatbot de Move on Academy. Siéntete libre de chatear con MOA",
    },
  ]);

  const { Moralis } = useMoralis();

  const [values, setValues] = useState({
    userResponse: "",
  });
  const recorderControls = useAudioRecorder()
  const addAudioElement = async(blob) => {
const file = new File([blob], "input.wav", { type: "audio/wav" });

    let completion = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
  });
  let newHistory = [...history, { role: "user", content: completion.text}];
  
  let res=await Moralis.Cloud.run(
    "chatgpt",
    { history:newHistory, userResponse:values.userResponse}
  );
 
setHistory([...newHistory, {role:"assistant",content:res}])

  };
  const [buffer,setBuffer]=useState(null)

  async function handleTextToSpeech(newSpeech){ 
    var player = new talkify.TtsPlayer(); //or new talkify.Html5Player()
    player.playText('Hello world');

  }
  async function handleChat(){
    setValues({userResponse:""})

    let newHistory = [...history, { role: "user", content: values.userResponse}];
  /
    let res=await Moralis.Cloud.run(
      "chatgpt",
      { history:newHistory, userResponse:values.userResponse}
    );
   
  console.log(JSON.stringify(res)) 
  setHistory([...newHistory, {role:"assistant",content:res}])
  
  }
  const [isLoading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    startRecording()
    setValues({userResponse:""})
  }

  async function handleStop() {
    setLoading(false);
    stopRecording()
     }

  const handleChange = useCallback(
    async (event) => {
      setValues((prevState) => ({
        ...prevState,
        ["userResponse"]: event
      }));
    });
    const selector = useCallback(voices => [...voices].find(v => v.lang === 'zh-HK'), []);

  return (<div style={{ position: "relative", height: "90%" }}>
      <Typography style={{textAlign:"center",color:'lightblue'}} variant="h4" component="h3">Chatbot de sistema MOA</Typography>
      <MainContainer style={{ marginTop: 20 }}>
       <ChatContainer>
          <MessageList>
            {history.map((message, index) => (
              <Stack style={{marginTop:10,flexDirection:"row"}} key={index}>
                {message.role=="assistant"?
                <Avatar
                alt="Remy Sharp"
                src="https://bafkreiaos6lu6fvwjooorczobs6k7svnfcfya3zasvixsje77pejoqrvwu.ipfs.nftstorage.link/"
                sx={{ width: 56, height: 56,marginRight:2 }}
              />:
                <AccountCircleIcon                sx={{ width: 56, height: 56,marginRight:2 }}
                />}
                 

                <Message
                  key={index}
                  name="userResponse"
                  style={{marginRight:20}}
                  model={{
                    sentTime: "just now",
                    message: message.role + ": " + message.content,
                    sender: message.role,
                  }}
                />
               <SayButton
    speak={ message.content }
    voice={ selector}
    style={{marginLeft:10,height:30, backgroundColor:"transparent",borderColor:"transparent"}}
      >
    <VolumeUpIcon />
  </SayButton>
    
              </Stack>
            ))}
          </MessageList>
          <div as={MessageInput} style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            padding
            Left:10,
            marginBottom: 0,
          }}>
            {!isLoadingAudio? <AudioRecorder 
               downloadFileExtension="wav"
        onRecordingComplete={(blob) => addAudioElement(blob)}
        recorderControls={recorderControls}
        style={{
          flexGrow: 1,}}
      />:<div style={{justifyContent:"center",alignItems:'center',flex:1}}><CircularProgress size={20}/></div>}
            <MessageInput 
            attachButton={false}  
            style={{
              flexGrow: 1,
              borderTop: 0,
              flexShrink: "initial"
            }}

            sendDisabled={false} onSend={handleChat} value={values.userResponse} onChange={handleChange} placeholder="Type message here" />
        
        
          </div>
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

Chatbot.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Chatbot;
