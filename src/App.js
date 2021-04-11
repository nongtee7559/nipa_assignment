import React, { useState, useRef } from 'react';
import './App.css';
import nvision from '@nipacloud/nvision/dist/browser/nvision'
import Webcam from "react-webcam";

const getObjectDetectionData = async encodeBase64 => {
  const objectDetectionService = nvision.objectDetection({
    apiKey: "cdb29f355cb4059995e05420dc8d963f657898bf3a5f2f5e7a88c58279f5e4a0a1c4c4cf874594b42e413fc45c425425ac"
  });
  return objectDetectionService.predict({
    rawData: encodeBase64
  });
}

const getEncodeBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

const App = () => {

  const [image, setImage] = useState(null);
  const [overlayBox, setOverlayBox] = useState(null);
  const [camera, setCamera] = useState(false);
  const webcamRef = useRef(null);

  const createOverlayBox = async base64 => {
    let listElement = [];
    const response = await getObjectDetectionData(base64);
    if (response.detected_objects) {
      response.detected_objects.forEach((element, index) => {
        if (element.confidence > 0.2) {
          let top = element.bounding_box.top;
          let left = element.bounding_box.left;
          let height = element.bounding_box.bottom - top;
          let width = element.bounding_box.right - left;
          var temp = (<div key={index} className="overlay-box" style={{ top: top, left: left, width: width, height: height }}></div>);
          listElement.push(temp);
        }
      });
    }
    setOverlayBox(listElement);
  }

  const onImageChange = async event => {
    if (event.target.files && event.target.files[0]) {
      setCamera(false);
      let img = event.target.files[0];
      let base64 = await getEncodeBase64(img);
      await createOverlayBox(base64);
      setImage(URL.createObjectURL(img));
    }
  }

  const onCameraClick = () => {
    setImage(null);
    setOverlayBox(null);
    setCamera(true);
    document.getElementById('uploadImage').value = null; //clear upload file
  }

  const onTakePhotoClick = async () => {
    setCamera(false);
    let img = webcamRef.current.getScreenshot();
    let base64 = img.split(',')[1];
    await createOverlayBox(base64);
    setImage(img);
  }

  return (
    <div>
      <div className="header">
        <h1>Object Detection</h1>
        <button id="camera" onClick={onCameraClick} >Camera</button>
        <button id="takePhoto" onClick={onTakePhotoClick} disabled={!camera}>Take Photo</button>
        <input type="file" id="uploadImage" onChange={onImageChange} />
      </div>
      <div id="wrapper">
        <img id="picture" src={image} />
        {
          camera && image == null ?
            <Webcam audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg" />
            : null
        }
        {overlayBox}
      </div>
    </div>
  );
}


export default App;
