import { FilesetResolver, FaceDetector, FaceDetectorResult } from "@mediapipe/tasks-vision";
import type { Rect } from "./interface/rect";

export class GoogleMediaPipeFaceDetectorWrapper {
     constructor() {}
  
    vision: any;
    facedetector: FaceDetector | undefined;

    showMessage = (): boolean => {
        try {
            alert("Package Alert");
            return true;
        } catch (error) {
            console.log(`Show Message ${error}`);
            return false;
        }
    }
  
     load = async (): Promise<boolean> => {
        try {
            this.vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                // "assets/wasm"
            );
            this.facedetector = await FaceDetector.createFromModelPath(
                this.vision,
                "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
                // "assets/blaze_face_short_range.tflite"
            );
            return true;
        } catch (error) {
            this.vision = undefined;
            this.facedetector = undefined;
            console.log(`Initialization Error: ${error}`);
            return false;
        }
    }
  
    close = async (): Promise<boolean> => {
        try {
            this.facedetector?.close();
            this.vision = undefined;
            this.facedetector = undefined;
            return true;
        } catch (error) {
            console.log(`Closing Error ${error}`);
            return false;
        }
    }
    
    preprocess = async (imagePath: string): Promise<ImageBitmap|null> => {
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            let imageBitmap : ImageBitmap =  await createImageBitmap(blob);
            return imageBitmap;
        } catch (error) {
            console.log("Preprocessing error");
            return null;
        }
    }

    detect = (image: ImageBitmap): Rect[] | null => {
        try {
            let result: FaceDetectorResult | undefined  = this.facedetector?.detect(image);
            if(result==undefined) {
                throw 'Error occurred while detecting face';
            }
            let faces: Rect[] = [];
            if (result.detections.length > 0) {
                result.detections.forEach(
                    (detection) => {
                        if (detection.boundingBox) {
                            const boundingBox = detection.boundingBox;
                            const right = boundingBox.originX + boundingBox.width;
                            const bottom = boundingBox.originY + boundingBox.height;
                            const left = boundingBox.originX ;
                            const top = boundingBox.originY ;
                            const rect: Rect = {
                                left: left,
                                top: top,
                                right: right,
                                bottom: bottom
                            };
                            faces.push(rect);
                        }
                    },
                );
            }
            return faces;
        } catch (error) {
            console.log(`Face Detection Error ${error}`);
            return null;
        }
    }
}

// declare global {
//   interface Window {
//     detectFaces: (image: ImageData) => Promise<void>;
//   }
// }


// document.addEventListener('DOMContentLoaded', (event) => {
//   enableCamera();
// });

// async function enableCamera(): Promise<void> {
//   // Access video element
//   const videoElement = document.getElementById('inputVideo') as HTMLVideoElement;
//   // Check if webcam access is available
//   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       try {
//           // Request access to webcam
//           const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//           // Display webcam stream on video element
//           videoElement.srcObject = stream;
//       } catch (error) {
//           console.error('Error accessing webcam:', error);
//       }
//   }
// }

// window.detectFaces = async (image: ImageData): Promise<void> => {
//   let faceDetection: GoogleMediaPipeFaceDetectorWrapper = await GoogleMediaPipeFaceDetectorWrapper.load();
//   let result = await faceDetection.detect(image);
//     const canvasElement = document.getElementById('outputCanvas') as HTMLCanvasElement;
//     const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//     result.forEach(
//       (face) => {
//         if (face) {
//           canvasCtx.beginPath();
//           canvasCtx.rect(face.left, face.top, face.right - face.left, face.bottom - face.top);
//           canvasCtx.lineWidth = 2;
//           canvasCtx.strokeStyle = 'red';
//           canvasCtx.stroke();
//         }
//       },
//     );
// }