import { uploadWithChunks } from '../lib';

document.getElementById('upload-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('upload-file');
  const file = fileInput.files[0];
  uploadWithChunks(file, {
    onChunkUploaded: (chunkData, uploadedCount, totalCount) => {
      console.log(`chunk upload complete: ${uploadedCount}/${totalCount}`, chunkData);
    },
    onFileUploaded: (fileData) => {
      console.log(`file upload complete: ${fileData.size}/${file.size}`, fileData);
    }
  });
});
