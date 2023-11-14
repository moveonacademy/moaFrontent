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
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { async } from 'react-cloudinary-upload-widget';
import OpenAI from 'openai';
import { CircularProgress } from '@mui/material';

const Chatbot = () => {
  const [isLoading2, setLoading2] = useState(false);
  const [isLoadingAudio, setLoadingAudio] = useState(false);

  const openai = new OpenAI({ apiKey:process.env.OPENAI_API_TOKEN, dangerouslyAllowBrowser: true })

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

    const completion = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
  });
  let newHistory = [...history, { role: "user", content: completion.text}];
  
  let res=await Moralis.Cloud.run(
    "chatgpt",
    { history:newHistory, userResponse:values.userResponse}
  );
 
console.log(JSON.stringify(res))
setHistory([...newHistory, {role:"assistant",content:res}])

  };
  async function handleChat(){
    let newHistory = [...history, { role: "user", content: values.userResponse}];
  
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
  return (
    <div style={{ position: "relative", height: "90%" }}>
       
      <MainContainer style={{ marginTop: 20 }}>
       <ChatContainer>
          <MessageList>
            {history.map((message, index) => (
              <div key={index}>
                <Message
                  key={index}
                  name="userResponse"
                  model={{
                    sentTime: "just now",
                    message: message.role + ": " + message.content,
                    sender: message.role,
                  }}
                />
                <Speech
                  text={message.content}
                  pitch={1.5}
                  rate={1}
                  volume={1}
                  startBtn={startBtn}
                  pauseBtn={pauseBtn}
                  stopBtn={stopBtn}
                  props={{ title: 'React Text-To-Speech Component' }}
                  onError={() => console.error('Browser not supported!')}
                />
              </div>
            ))}
          </MessageList>
          <div as={MessageInput} style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            marginBottom: 0,
          }}>
            <MessageInput style={{
              flexGrow: 1,
              borderTop: 0,
              flexShrink: "initial"
            }}

            sendDisabled={false} onSend={handleChat} value={values.userResponse} onChange={handleChange} placeholder="Type message here" />
        {!isLoadingAudio? <AudioRecorder 
               downloadFileExtension="wav"

        onRecordingComplete={(blob) => addAudioElement(blob)}
        recorderControls={recorderControls}
      />:<div style={{justifyContent:"center",alignItems:'center',flex:1}}><CircularProgress size={20}/></div>}
        
        
          {/*   <Button  onClick={isLoading?handleStop:handleStart} variant="contained">{ isLoading?    <MicIcon/>    
 :<MicNoneIcon/>}</Button> */}
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
