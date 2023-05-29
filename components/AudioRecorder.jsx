import React, { useState, useMemo } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import Loader from './Loader';
import mic from '/app/mic.svg';
import Image from 'next/image';

const AudioRecorder = (props) => {

  const [audio, setAudio] = useState();
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  const recorder = useMemo(() => new MicRecorder({ bitRate: 128 }), []);

  const startRecording = () => {
    if (isBlocked) {
      console.log('Permission Denied');
      setIsBlocked(true);
    } else {
      recorder
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch(e => console.error(e));
    }
  }

  const stopRecording = async() => {

    setIsRecording(false);
    setLoading(true);

    recorder
    .stop()
    .getMp3()
    .then(([buffer, blob]) => {
      const file = new File(buffer, 'test.mp3', {
        type: blob.type,
        lastModified: Date.now()
      });
      setBlobURL(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async function () {
        const base64data = reader.result;
        const base64String = base64data.split(',')[1];
        setAudio(base64String);
        const response = await fetch('/api/openAIAudio', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: base64String }),
        });
    
        const data = await response.json();
        console.log(data.status);
        setTranscription(data.result);
        props.onTranscript(data.result);
      }
    })

    setLoading(false);
  }
  
  const handleSubmit = () => {
    setAudio('');
    setTranscription('');
    props.onTranscript('');
  }

  return (
    <div>
      <label htmlFor="my-modal-3" className="btn btn-accent"><Image src={mic} alt="Voice Input"/></label>
      <input type="checkbox" id="my-modal-3" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative">
          <label htmlFor="my-modal-3" className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 className="text-lg font-bold">Speak Now!</h3>
          <div className="mt-10 space-x-3 flex justify-center">
            <button className="btn btn-accent btn-sm" onClick={startRecording} disabled={isRecording}>
              Start Recording
            </button>
            <button className="btn btn-accent btn-sm" onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
          </div>
          <div className="mt-10 flex justify-center">
            <audio src={blobURL} controls />
          </div>
          <p className="py-4">
            {!loading && transcription}
          </p>
          <button className="btn btn-accent btn-sm" onClick={handleSubmit}>Clear</button>
        </div>
      </div>
      {loading && <Loader />}
    </div>
  );
}

export default AudioRecorder;