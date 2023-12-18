// 'use strict';
import { useEffect } from 'react';
import DID_API from './api.json' assert { type: 'json' };

// ... (código anterior)
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const Chatbot = () => {
  'use strict';
  
  if (DID_API.key == '🤫') alert('Please put your API key inside ./api.json and restart.');
  
  // Load the OpenAI API from file new 10/23 
  // OpenAI API endpoint set up new 10/23 
  async function fetchOpenAIResponse(userMessage) {
  try{
    
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
    });
    console.log("response "+JSON.stringify(response))
    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
    
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

  let destroyButton;
  

  useEffect(()=>{
     talkVideo = document.getElementById('talk-video');

    talkVideo.setAttribute('playsinline', '');
    peerStatusLabel = document.getElementById('peer-status-label');
    iceStatusLabel = document.getElementById('ice-status-label');
    iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
    signalingStatusLabel = document.getElementById('signaling-status-label');
    streamingStatusLabel = document.getElementById('streaming-status-label');
     talkButton = document.getElementById('talk-button');
      destroyButton = document.getElementById('destroy-button');

    connectButton = document.getElementById('connect-button');
    connectButton.onclick = async () => {
      if (peerConnection && peerConnection.connectionState === 'connected') {
        return;
      }
    
      stopAllStreams();
      closePC();
    
      const sessionResponse = await fetch(`${DID_API.url}/talks/streams`, {
        method: 'POST',
        headers: {'Authorization': `Basic ${DID_API.key}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({
          source_url: "https://raw.githubusercontent.com/jjmlovesgit/D-id_Streaming_Chatgpt/main/oracle_pic.jpg",
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
    };
    
  // This is changed to accept the ChatGPT response as Text input to D-ID #138 responseFromOpenAI 
  talkButton.onclick = async () => {
    console.log("signal "+peerConnection?.signalingState)
    if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
      //
      // New from Jim 10/23 -- Get the user input from the text input field get ChatGPT Response
      const userInput = document.getElementById('user-input-field').value;
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

          'driver_url': 'bank://subtle/',
          'config': {
            'stitch': true,
          },
          'session_id': sessionId
        })
      });
      console.log("talkResponse "+JSON.stringify(talkResponse))
    }
  };
  destroyButton.onclick = async () => {
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
  };
  
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
    talkVideo.src = 'oracle_Idle.mp4';
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
    <div style={{ position: "relative", height: "90%" }}>
      
        <div id="content">
          <div id="video-wrapper">
            <div>
              <video id="talk-video" width="400" height="400" autoPlay></video>
            </div>
          </div>
          <br />
          <div id="input-container">
            <input type="text" id="user-input-field" placeholder="I am your ChatGPT Live Agent..." />
            <hr />
          </div>
          <div id="buttons">
            <button id="connect-button" type="button">Connect</button>
            <button id="talk-button" type="button">Start</button>
            <button id="destroy-button" type="button">Destroy</button>
          </div>

          <div id="status">
            ICE gathering status: <label id="ice-gathering-status-label"></label>
            <br />
            ICE status: <label id="ice-status-label"></label><br />
            Peer connection status: <label id="peer-status-label"></label><br />
            Signaling status: <label id="signaling-status-label"></label><br />
            Streaming status: <label id="streaming-status-label"></label><br />
          </div>
        </div>
        <script type="module" src="../api/index.js"></script>
      
    </div>
  );
}

Chatbot.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Chatbot;