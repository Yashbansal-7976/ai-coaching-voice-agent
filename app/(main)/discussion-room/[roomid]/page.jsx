  "use client";
  import { api } from '@/convex/_generated/api';
  import { CoachingExpert } from '@/services/Options';
  import { UserButton } from '@stackframe/stack';
  import { useQuery, useMutation } from 'convex/react';
  import { useParams } from 'next/navigation';
  import React, { useEffect, useRef, useState, useContext } from 'react';
  import Image from 'next/image';
  import { Button } from '@/components/ui/button';
  import dynamic from 'next/dynamic';
  import { getToken } from '@/services/GlobalServices';
import { toast } from 'sonner';
import { UserContext } from '@/app/_context/UserContext';
import { Loader2Icon } from 'lucide-react';
import Webcam from 'react-webcam';
import ChatBox from './ChatBox';
import { AIModel, ConvertTextToSpeech } from '@/services/AIServices';

  const RecordRTC = dynamic(() => import('recordrtc'), { ssr: false });
  const RealtimeTranscriber = dynamic(() => import('@/services/realtimeTranscriber'), { ssr: false });

  function DiscussionRoom() {
    const { roomid } = useParams();
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
    const [userData,setUserData]=useContext(UserContext);
    const [expert, setExpert] = useState(null);
    const [enableMic, setEnableMic] = useState(false);
    const recorder = useRef(null);
    const [transcribe, setTranscribe] = useState("");
    const [loading,setLoading]=useState(false);
    const [enableFeedbackNotes,setEnableFeedbackNotes]=useState(false);
    const [conversation, setConversation] = useState([{role:'assistant',content: "Hi"},{role:'user',content:'hello'}]); //editing
    const realtimeTranscriberRef = useRef(null);
    const [audioUrl,setAudioUrl] =useState();
    const UpdateConversation=useMutation(api.DiscussionRoom.UpdateConversation);
    const updateUserToken=useMutation(api.users.UpdateUserToken);
    let silenceTimeout;
    let texts = {};

    useEffect(() => {
      if (DiscussionRoomData) {
        const Expert = CoachingExpert.find(item => item.name == DiscussionRoomData.expertName);
        setExpert(Expert);
      }
    }, [DiscussionRoomData]);

    const connectToServer = async () => {
      setEnableMic(true);
      setLoading(true);

      // Init Assembly AI
      realtimeTranscriberRef.current = new RealtimeTranscriber({
        token: await getToken(),
        sample_rate: 16_000
      })

      realtimeTranscriberRef.current.on('transcript', async (transcript) => {
        console.log(transcript)
        let msg = '';
        if (transcript.message_type === 'FinalTranscript') {
          setConversation(prev => [...prev, {
            role: 'user',
            content: transcript.text
          }]);
          
          if (userData && DiscussionRoomData) {
            await updateUserTokenMethod(transcript.text);
            // Calling AI text Model to Get Response
            
            const lastTwoMsg = conversation.slice(-2);
            try {
              const aiResp = await AIModel(
                  DiscussionRoomData.topic || "",
                  DiscussionRoomData.coachingOption || "",
                  lastTwoMsg || []);
              
              if (aiResp && aiResp.content) {
                const url = await ConvertTextToSpeech(aiResp.content,
                            DiscussionRoomData.expertName || "Joanna");
                console.log(url)
                setAudioUrl(url);
                setConversation(prev => [...prev, aiResp]);
              }
            } catch (error) {
              console.error("Error processing AI response:", error);
              toast.error("Failed to get AI response");
            }
          }
        }
        
        texts[transcript.audio_start] = transcript?.text;
        const keys = Object.keys(texts);
        keys.sort((a, b) => a - b);

        for (const key of keys) {
          if (texts[key]) {
            msg += `${texts[key]}`
          }
        }
        setTranscribe(msg);
      })

      await realtimeTranscriberRef.current.connect();
      setLoading(false);
      setEnableMic(true);
      toast('Connected...')
      if (typeof window !== "undefined" && typeof navigator !== "undefined") {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            recorder.current = new RecordRTC(stream, {
              type: 'audio',
              mimeType: 'audio/webm;codecs=pcm',
              recorderType: RecordRTC.StereoAudioRecorder,
              timeSlice: 250,
              desiredSampRate: 16000,
              numberOfAudioChannels: 1,
              bufferSize: 4096,
              audioBitsPerSecond: 128000,
              ondataavailable: async (blob) => {
                if (!realtimeTranscriberRef.current) return;

                clearTimeout(silenceTimeout);

                const buffer = await blob.arrayBuffer();
                console.log(buffer)
                realtimeTranscriberRef.current.sendAudio(buffer);

                silenceTimeout = setTimeout(() => {
                  console.log('User stopped talking');
                }, 2000);
  
                recorder.current.startRecording();
              }
            }).catch((err) => console.error(err));
          });
      }
    }
    useEffect(() => {
      async function fetchData() {
          if (conversation && conversation.length > 0 && conversation[conversation.length - 1].role === 'user' && DiscussionRoomData && userData) {
              // Calling AI text Model to Get Response
              const lastTwoMsg = conversation.slice(-2);
              try {
                  // AI Model call
                  const aiResp = await AIModel(
                      DiscussionRoomData.topic || "",
                      DiscussionRoomData.coachingOption || "",
                      lastTwoMsg || []
                  );
                  if (aiResp && aiResp.content) {
                      const url = await ConvertTextToSpeech(aiResp.content, DiscussionRoomData.expertName || "Joanna");
                      console.log(url);
                      setAudioUrl(url);
                      setConversation(prev => [...prev, aiResp]);
                      await updateUserTokenMethod(aiResp.content);
                  }
              } catch (error) {
                  console.error("Error in AI processing:", error);
                  toast.error("Failed to get AI response");
              }
          }
      }
  
      const waitForPause = setTimeout(() => {
          console.log("WAIT...");
          fetchData();
      }, 580);
  
      console.log(conversation);
  
      // Cleanup function to clear the timeout
      return () => clearTimeout(waitForPause);
  }, [conversation, DiscussionRoomData, userData]);

    
    const disconnect = async (e) => {
      e.preventDefault();
      setLoading(true);
      await realtimeTranscriberRef.current.close();
      recorder.current.pauseRecording();
      recorder.current = null;
      setEnableMic(false);
      toast('Disconnected!')
      await UpdateConversation({
          id:DiscussionRoomData._id,
          conversation: conversation
      })
      setLoading(false);
      setEnableFeedbackNotes(true);
      
    }
    const updateUserTokenMethod = async (text) => {
      const tokenCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const result = await updateUserToken({
          id: userData._id,
          credits: Number(userData.credits) - Number(tokenCount)
      });
      setUserData(prev => ({
          ...prev,
          credits: Number(prev.credits) - Number(tokenCount)
      }));
  };
  
  return (
    <div className='-mt-12'>
        <h2 className='text-lg font-bold'>{DiscussionRoomData?.coachingOption}</h2>
        <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>
            <div className='lg:col-span-2'>
                <div className='h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
                    {expert?.avatar && (
                        <Image
                            src={expert?.avatar}
                            alt='Avatar'
                            width={200}
                            height={200}
                            className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
                        />
                    )}
                    <h2 className='text-gray-500'>{expert?.name}</h2>
                    <audio src={audioUrl} type="audio/mp3" autoPlay />
                    {/* <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
                        <UserButton /> */}
                </div>
                <div className='absolute bottom-10 right-10'>
                    <Webcam
                        height={80}
                        width={130}
                        className='rounded-2xl'
                    />
                </div>
            </div>
            <div className='mt-5 flex items-center justify-center'>
                {!enableMic ? (
                    <Button onClick={connectToServer} disabled={loading}>
                        {loading && <Loader2Icon className='animate-spin' />}
                        Connect
                    </Button>
                ) : (
                    <Button variant="destructive" onClick={disconnect} disabled={loading}>
                        {loading && <Loader2Icon className='animate-spin' />}
                        Disconnect
                    </Button>
                )}
            </div>
            <div>
                <ChatBox
                    conversation={conversation}
                    enableFeedbackNotes={enableFeedbackNotes}
                    coachingOption={DiscussionRoomData?.coachingOption}
                />
            </div>
            <div>
                <div className='h-[60vh] bg-secondary border rounded-4xl flex flex-col items-center justify-center relative'>
                    <h2>Chat Section</h2>
                </div>
                <h2 className='mt-4 text-gray-400 text-sm'>
                    At the end of your conversation, we will automatically generate feedback/notes from your conversation.
                </h2>
            </div>
        </div>
        <div>
            <h2>{transcribe}</h2>
        </div>
    </div>
);
}

export default DiscussionRoom;