// 'use strict';
import DID_API from './api.json' assert { type: 'json' };
import { SayButton } from 'react-say';
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
import user from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box } from '@mui/system';
// ... (código anterior)
const openai = new OpenAI({ apiKey:process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true })

const Chatbot = () => {
  'use strict';
  const selector = useCallback(voices => [...voices].find(v => v.lang === 'zh-HK'), []);
  const { Moralis } = useMoralis();


  const handleChange = useCallback(
    async (event) => {
      setValues((prevState) => ({
        ...prevState,
        ["userResponse"]: event
      }));
    });
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content: "Bienvenido al chatbot de Move on Academy. Siéntete libre de chatear con MOA",
    },
  ]);
  if (DID_API.key == '🤫') alert('Please put your API key inside ./api.json and restart.');
  const [isLoadingAudio, setLoadingAudio] = useState(false);
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
     
    setHistory([...newHistory, {role:"assistant",content:res}])
    const talkResponse = await fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}`, {
      method: 'POST',
      headers: { 
        Authorization: `Basic ${DID_API.key}`, 
        'Content-Type': 'application/json'
     },
      body: JSON.stringify({
        script: {
          type: 'text',
          subtitles: 'false',
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
          ssml: false,
          input:res  //send the openAIResponse to D-id
        },
        config: {
          fluent: true,
          pad_audio: 0,
          driver_expressions: {
            expressions: [{ expression: 'neutral', start_frame: 0, intensity: 0 }],
            transition_frames: 0
          },
          align_driver: true,
          align_expand_factor: 0,
          auto_match: true,
          motion_factor: 0,
          normalization_factor: 0,
          sharpen: true,
          stitch: true,
          result_format: 'mp4'
        },   

        'driver_url': 'bank://lively/',
        'config': {
          'stitch': true,
        },
        'session_id': sessionId
      })
    });
      };
  const [values, setValues] = useState({
    userResponse: "",
  });

  // Load the OpenAI API from file new 10/23 
  // OpenAI API endpoint set up new 10/23 
  async function fetchOpenAIResponse(userMessage) {
  try{
    setValues({userResponse:""})

    let newHistory = [...history, { role: "user", content: userMessage}];
  
    let res=await Moralis.Cloud.run(
      "chatgpt",
      { history:newHistory, userResponse:userMessage}
    );
   
  console.log(JSON.stringify(res)) 
  setHistory([...newHistory, {role:"assistant",content:res}])
/* 
    const response = await fetchWithRetries('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: userMessage}],
        temperature: 0.7,
        max_tokens: 25
      }),
    }); */
    /* console.log("response "+JSON.stringify(response))
    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    } *//* 
    const data = await response.json(); */
    return res.trim();
    
  }catch (e){
    console.log(e)
  }
  }
    
  //same  - No edits from Github example for this whole section
  const RTCPeerConnection = (
    window.RTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection
  ).bind(window);
  
  let peerConnection;
  let streamId;
  let sessionId;
  let sessionClientAnswer;
  
  let statsIntervalId;
  let videoIsPlaying;
  let lastBytesReceived;
  
  let talkVideo;

  let iceStatusLabel;
  let iceGatheringStatusLabel;
  let signalingStatusLabel;
  let streamingStatusLabel;
  let connectButton;
  let talkButton;
  let peerStatusLabel;

  const [loading,setLoading]=useState(false)

async function initStreaming(){
  
  if (peerConnection && peerConnection.connectionState === 'connected') {
    return;
  }

  stopAllStreams();
  closePC();

  const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
    method: 'POST',
    headers: {'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      source_url: "https://i.postimg.cc/fLdQq0DW/thumbnail.jpg",
    }),
  });

  const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
  streamId = newStreamId;
  sessionId = newSessionId;
  
  try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
  } catch (e) {
    console.log('error during streaming setup', e);
    stopAllStreams();
    closePC();
    return;
  }

  const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`,
    {
      method: 'POST',
      headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
    });
}
const [iniciando,setIniciando]=useState(false)

const [connected,setConnected]=useState(false)
  useEffect(()=>{
    
     talkVideo = document.getElementById('talk-video');

    talkVideo.setAttribute('playsinline', '');
    peerStatusLabel = document.getElementById('peer-status-label');
    iceStatusLabel = document.getElementById('ice-status-label');
    iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
    signalingStatusLabel = document.getElementById('signaling-status-label');
    streamingStatusLabel = document.getElementById('streaming-status-label');
     talkButton = document.getElementById('talk-button');

    connectButton = document.getElementById('connect-button');

    connectButton.onclick = async () => {
      if (peerConnection && peerConnection.connectionState === 'connected') {
       setConnected(true)
        return;
      }
      setIniciando(true)
    
      stopAllStreams();
      closePC();
    
      const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
        method: 'POST',
        headers: {'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({
          source_url: "https://i.postimg.cc/fLdQq0DW/thumbnail.jpg",
        }),
      });
    
      const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
      streamId = newStreamId;
      sessionId = newSessionId;
      
      try {
        sessionClientAnswer = await createPeerConnection(offer, iceServers);
            setConnected(true)
            setIniciando(false)

      } catch (e) {
        console.log('error during streaming setup', e);
        stopAllStreams();
        closePC();
               setConnected(false)
               setIniciando(false)


        return;
      }
    
      const sdpResponse = await fetch(`${DID_API.url}/talks/streams/${streamId}/sdp`,
        {
          method: 'POST',
          headers: {Authorization: `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
          body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
        });
    };
  // This is changed to accept the ChatGPT response as Text input to D-ID #138 responseFromOpenAI 
  talkButton.onclick = async () => {
    console.log("signal "+peerConnection?.signalingState)
    setLoading(true)
    if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
      //
      // New from Jim 10/23 -- Get the user input from the text input field get ChatGPT Response
      const userInput = document.getElementById('user-input-field').value;
      document.getElementById('user-input-field').value = '';
      console.log("userInput "+JSON.stringify(userInput))

      const responseFromOpenAI = await fetchOpenAIResponse(userInput);
      //
      // Print the openAIResponse to the console
      //
      console.log("responseFromOpenAI "+JSON.stringify(responseFromOpenAI))
  
      const talkResponse = await fetchWithRetries(`${DID_API.url}/talks/streams/${streamId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Basic ${DID_API.key}`, 
          'Content-Type': 'application/json'
       },
        body: JSON.stringify({
          script: {
            type: 'text',
            subtitles: 'false',
            provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
            ssml: false,
            input:responseFromOpenAI  //send the openAIResponse to D-id
          },
          config: {
            fluent: true,
            pad_audio: 0,
            driver_expressions: {
              expressions: [{ expression: 'neutral', start_frame: 0, intensity: 0 }],
              transition_frames: 0
            },
            align_driver: true,
            align_expand_factor: 0,
            auto_match: true,
            motion_factor: 0,
            normalization_factor: 0,
            sharpen: true,
            stitch: true,
            result_format: 'mp4'
          },   

          'driver_url': 'bank://lively/',
          'config': {
            'stitch': true,
          },
          'session_id': sessionId
        })
      });
      console.log("talkResponse "+JSON.stringify(talkResponse))
    }
  };
  /* destroyButton.onclick = async () => {
    await fetch(`${DID_API.url}/talks/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${DID_API.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
  
    stopAllStreams();
    closePC();
  }; */
  
  },[])
  
useEffect(()=>{
 // initStreaming()

},[])
  
  // NOTHING BELOW THIS LINE IS CHANGED FROM ORIGNAL D-id File Example
  //
  
  
  function onIceGatheringStateChange() {
    iceGatheringStatusLabel.innerText = peerConnection.iceGatheringState;
    iceGatheringStatusLabel.className = 'iceGatheringState-' + peerConnection.iceGatheringState;
  }
  function onIceCandidate(event) {
    console.log('onIceCandidate', event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
  
      fetch(`${DID_API.url}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: sessionId,
        }),
      });
    }
  }
  function onIceConnectionStateChange() {
    iceStatusLabel.innerText = peerConnection.iceConnectionState;
    iceStatusLabel.className = 'iceConnectionState-' + peerConnection.iceConnectionState;
    if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
      stopAllStreams();
      closePC();
    }
  }
  function onConnectionStateChange() {
    // not supported in firefox
    peerStatusLabel.innerText = peerConnection.connectionState;
    peerStatusLabel.className = 'peerConnectionState-' + peerConnection.connectionState;
  }
  function onSignalingStateChange() {
    signalingStatusLabel.innerText = peerConnection.signalingState;
    signalingStatusLabel.className = 'signalingState-' + peerConnection.signalingState;
  }
  
  function onVideoStatusChange(videoIsPlaying, stream) {
    let status;
    if (videoIsPlaying) {
      status = 'streaming';
      const remoteStream = stream;
      setVideoElement(remoteStream);
    } else {
      status = 'empty';
      playIdleVideo();
    }
    streamingStatusLabel.innerText = status;
    streamingStatusLabel.className = 'streamingState-' + status;
  }
  
  function onTrack(event) {
    /**
     * The following code is designed to provide information about wether currently there is data
     * that's being streamed - It does so by periodically looking for changes in total stream data size
     *
     * This information in our case is used in order to show idle video while no talk is streaming.
     * To create this idle video use the POST https://api.d-id.com/talks endpoint with a silent audio file or a text script with only ssml breaks 
     * https://docs.aws.amazon.com/polly/latest/dg/supportedtags.html#break-tag
     * for seamless results use `config.fluent: true` and provide the same configuration as the streaming video
     */
  
    if (!event.track) return;
  
    statsIntervalId = setInterval(async () => {
      const stats = await peerConnection.getStats(event.track);
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;
  
          if (videoStatusChanged) {
            videoIsPlaying = report.bytesReceived > lastBytesReceived;
            onVideoStatusChange(videoIsPlaying, event.streams[0]);
          }
          lastBytesReceived = report.bytesReceived;
        }
      });
    }, 500);
  }
  
  async function createPeerConnection(offer, iceServers) {
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({ iceServers });
      peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
      peerConnection.addEventListener('icecandidate', onIceCandidate, true);
      peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
      peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
      peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
      peerConnection.addEventListener('track', onTrack, true);
    }
  
    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');
  
    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log('create local sdp OK');
  
    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');
  
    return sessionClientAnswer;
  }
  
  function setVideoElement(stream) {
    if (!stream) return;
    talkVideo.srcObject = stream;
    talkVideo.loop = false;
  
    // safari hotfix
    if (talkVideo.paused) {
      talkVideo
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }
  function playIdleVideo() {
    talkVideo.srcObject = undefined;
    talkVideo.src = 'prs_alice.idle.mp4';
    talkVideo.loop = true;
  }
  
  function stopAllStreams() {
    if (talkVideo.srcObject) {
      console.log('stopping video streams');
      talkVideo.srcObject.getTracks().forEach((track) => track.stop());
      talkVideo.srcObject = null;
    }
  }
  
  function closePC(pc = peerConnection) {
    if (!pc) return;
    console.log('stopping peer connection');
    pc.close();
    pc.removeEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
    pc.removeEventListener('icecandidate', onIceCandidate, true);
    pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    pc.removeEventListener('connectionstatechange', onConnectionStateChange, true);
    pc.removeEventListener('signalingstatechange', onSignalingStateChange, true);
    pc.removeEventListener('track', onTrack, true);
    clearInterval(statsIntervalId);
    iceGatheringStatusLabel.innerText = '';
    signalingStatusLabel.innerText = '';
    iceStatusLabel.innerText = '';
    peerStatusLabel.innerText = '';
    console.log('stopped peer connection');
    if (pc === peerConnection) {
      peerConnection = null;
    }
  }
  
  const maxRetryCount = 3;
  const maxDelaySec = 4;
  // Default of 1 moved to 5
  async function fetchWithRetries(url, options, retries = 3) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
  
        await new Promise((resolve) => setTimeout(resolve, delay));
  
        console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
        return fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. error: ${err}`);
      }
    }
  }
  return (
    <div style={{ position: "relative",justifyContent:"center",alignItems:"center", flexDirection:"row",height: "90%" }}>
        <button style={{backgroundColor:connected?'green':'blue'}} disabled={connected?true:false} id="connect-button" type="button">{connected?"Conectado":iniciando?"Cargando":"Iniciar Chatbot"}</button>

    <div id="status" >
      <Box style={{flexDirection:'row',position:"absolute",opacity:0}}>
             gathering : <label id="ice-gathering-status-label"></label>
            <br />
             status: <label id="ice-status-label"></label><br />
             connection : <label id="peer-status-label"></label><br />
            signaling : <label id="signaling-status-label"></label><br />
            streaming : <label id="streaming-status-label"></label><br />
            </Box>   </div>
      
        <script type="module" src="../api/index.js"></script>
        <div style={{ position: "relative", flexDirection:"row",height: "90%" }}>
    

      <MainContainer style={{ marginTop: 20 }}>
        
      <div style={{margin:10}}>
                   <video id="talk-video" width="200" height="200" autoPlay></video>
                 </div>
       <ChatContainer>
          <MessageList>
            {history.map((message, index) => (
              <Stack style={{marginTop:10,flexDirection:"row"}} key={index}>
               

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

    
              </Stack>
            ))}
          </MessageList>
          <div as={MessageInput} style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            width:"100%",
            paddingRight:90,
          }}>
            
                     
      
        <input type="text" id="user-input-field" placeholder="I am your english assistance..."/>
  
                 <button style={{marginLeft:-80}}  disabled={!connected} id="talk-button" type="button">Send</button>
                 {!isLoadingAudio? <AudioRecorder 
               downloadFileExtension="wav"
        onRecordingComplete={(blob) => addAudioElement(blob)}
        recorderControls={recorderControls}
        style={{
          flexGrow: 1,}}
      />:<div style={{justifyContent:"center",alignItems:'center',flex:1}}><CircularProgress size={20}/></div>}
{/* 
            <MessageInput 
            attachButton={false}  
            style={{
              flexGrow: 1,
              borderTop: 0,
              flexShrink: "initial"
            }}
            id="talk-button"
            type="button"
            sendDisabled={false} value={values.userResponse} onChange={handleChange} placeholder="Type message here" />
        
         */}
          </div>
        </ChatContainer>
      </MainContainer>
      
    </div>
   
    </div>
  );
}

Chatbot.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Chatbot;