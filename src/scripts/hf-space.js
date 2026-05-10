import { createRepo } from '@huggingface/hub'

console.log("Token being used:", process.env.HF_TOKEN?.slice(0, 5))

await createRepo({
  repo: { type: 'space', name: `Anirban0011/${process.env.REPO}` },
  token: process.env.HF_TOKEN,
  spaceSDK: 'docker',
  ifExists: 'ignore'
})