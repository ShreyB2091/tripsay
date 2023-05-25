import React, { useEffect, useState, useRef } from 'react';
import mic from '/app/mic.svg';
import Image from 'next/image';

const VoiceRecorder: React.FC = () => {

  const [isLoading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setAudioStream(stream);
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
    } else {
      console.error('getUserMedia is not supported');
    }
  }, []);

  const handleStartRecording = () => {
    if (audioStream) {
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    const audioFile = event.data;
    // const audioFile = new File([audioBlob], 'audio.wav', { type: audioBlob.type })
    // chunksRef.current.push(audioBlob);
    // const formData = new FormData();
    // formData.append('file', audioBlob, 'audio.wav');

    // try {
    //   const response = await fetch('/api/openAIAudio', {
    //     method: 'POST',
    //     body: formData,
    //   });
    //   if (response.ok) {
    //     const data = await response.json();
    //     setTranscription(data.text);
    //   } else {
    //     console.error('Error processing audio:', response.status);
    //   }
    // } catch (error) {
    //   console.error('Error processing audio:', error);
    // }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.wav');
    try {
      const response = await fetch('/api/openAIAudio', {
        method: 'POST',
        body: formData,
      });
      const { text, error } = await response.json();
      if (response.ok) {
        setLoading(false);
        setTranscription(text);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error processing audio:', error);
    }
  };

  const handleSaveRecording = () => {
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'recording.wav';
    link.click();
    URL.revokeObjectURL(audioUrl);
  };
  
  return (
    <div>
      <label htmlFor="my-modal-3" className="btn btn-accent"><Image src={mic} alt="Voice Input"/></label>
      <input type="checkbox" id="my-modal-3" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label htmlFor="my-modal-3" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 className="text-lg font-bold">Speak Now!</h3>
          <div className="mt-10 space-x-3 flex justify-center">
            <button className="btn btn-accent btn-sm" onClick={handleStartRecording} disabled={isRecording}> Start Recording
            </button>
            <button className="btn btn-accent btn-sm" onClick={handleStopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
            <button className="btn btn-accent btn-sm" onClick={handleSaveRecording} disabled={chunksRef.current.length === 0}>
              Save Recording
            </button>
          </div>
          <p className="py-4 mt-5">
            {/* {isLoading && <progress className="progress w-56"></progress>} */}
            {!isLoading && transcription}
            </p>
        </div>
      </div>
    </div>
  );
};
  
export default VoiceRecorder;
  