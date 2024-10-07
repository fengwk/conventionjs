import axios from 'axios';
import CryptoJS from 'crypto-js';

const defaultChunkSize = 1024 * 1024; // 1M
const defaultChunkUploadApi = '/api/sfile/chunk/upload';
const defaultChunkMergeApi = '/api/sfile/chunk/merge';
const defaultChunkUploadMaxRetryCount = 10;
const defaultChunkMergeMaxRetryCount = 3;

async function computeBolbMd5(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  return CryptoJS.MD5(wordArray).toString();
}

// 将file按照chunkSize切分为chunks
async function splitFileToChunks(file, config) {
  const chunkSize = config?.chunkSize || defaultChunkSize;
  const chunkUploadMaxRetryCount = config?.chunkUploadMaxRetryCount || defaultChunkUploadMaxRetryCount;
  const chunks = [];
  let index = 0;
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    const md5 = await computeBolbMd5(blob);
    const chunk = {
      index: index++,
      size: end - start,
      blob,
      chunkUploadMaxRetryCount,
      md5,
    };
    chunks.push(chunk);
    start = end;
  }
  return chunks;
}

function extractMd5List(chunks) {
  const md5List = [];
  for (const chunk of chunks) {
    if (chunk.complete && chunk.md5) {
      md5List.push(chunk.md5);
    }
  }
  return md5List;
}

async function mergeChunks(context, config) {
  const chunkMergeApi = config?.chunkMergeApi || defaultChunkMergeApi;
  const md5List = extractMd5List(context.chunks);

  try {
    const mergeRes = await axios.post(chunkMergeApi, {
      md5List,
      filename: context?.filename || '',
      chunksKey: context.chunksKey,
    });

    if (mergeRes && mergeRes.status >= 200 && mergeRes.status < 300) {
      const fileData = mergeRes.data?.data;
      if (config.onFileUploaded) {
        config.onFileUploaded(fileData);
      }
      return;
    }
  } catch (err) {
    console.error('merge chunks error', err);
  }

  if (context.chunkMergeMaxRetryCount > 0) {
    context.chunkMergeMaxRetryCount--;
    mergeChunks(context, config);
  }
}

async function uploadChunk(chunk, context, config) {
  const chunkUploadApi = config?.chunkUploadApi || defaultChunkUploadApi;

  const formData = new FormData();
  formData.append('chunk', chunk.blob);
  formData.append('md5', context.md5);

  try {
    const uploadRes = await axios.post(chunkUploadApi, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (uploadRes && uploadRes.status >= 200 && uploadRes.status < 300) {
      const chunkData = uploadRes?.data?.data;
      if (chunkData && chunkData.md5) {
        chunk.md5 = chunkData.md5;
        chunk.complete = true;
        const md5List = extractMd5List(context.chunks);
        const uploadedCount = md5List.length;
        const totalCount = context.chunks.length;
        if (config.onChunkUploaded) {
          config.onChunkUploaded(chunkData, uploadedCount, totalCount);
        }
        if (uploadedCount === totalCount) {
          mergeChunks(context, config);
        }
      }
      return;
    }
  } catch (err) {
    console.error('upload chunk error', err);
  }

  if (chunk.chunkUploadMaxRetryCount > 0) {
    chunk.chunkUploadMaxRetryCount--;
    uploadChunk(chunk, context, config);
  }
}

// 分块上传
// @param config.chunkSize 设置分块大小
// @param config.chunkUploadApi chunk上传api路径
// @param config.chunkMergeApi chunk合并api路径
// @param config.chunkUploadMaxRetryCount chunk上传最大重试次数
// @param config.chunkMergeMaxRetryCount chunk合并最大重试次数
// @param config.onChunkUploaded 在每一个chunk上传完成后回调，接收(chunkData, uploadedCount, totalCount)
// @param config.onFileUploaded 当文件全部完成传输后回调，接受(fileData)，如果文件已存在会直接调用onFileUploaded而不调用onChunkUploaded
// @param config.onFileUploadFailed 如果文件传输错误接受该回调（error）
export default async function uploadWithChunks(file, config) {
  const chunks = await splitFileToChunks(file, config);
  const context = {
    filename: file.name,
    size: file.size,
    chunks,
    chunkMergeMaxRetryCount: config?.chunkMergeMaxRetryCount || defaultChunkMergeMaxRetryCount,
  };
  for (const chunk of chunks) {
    uploadChunk(chunk, context, config);
  }
}
