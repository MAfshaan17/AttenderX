import fs from 'fs';
import https from 'https';
import path from 'path';

const MODELS_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const dir = './public/models';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

console.log('Downloading face-api.js models...');

models.forEach(model => {
  const file = fs.createWriteStream(path.join(dir, model));
  https.get(MODELS_URL + model, function(response) {
    if(response.statusCode !== 200) {
        console.error(`Failed to download ${model}: HTTP ${response.statusCode}`);
        return;
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${model}`);
    });
  }).on('error', (err) => {
      console.error(`Error downloading ${model}: ${err.message}`);
  });
});
