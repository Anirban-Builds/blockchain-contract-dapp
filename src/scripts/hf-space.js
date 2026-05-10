import { createRepo } from '@huggingface/hub'

await createRepo({
  repo: { type: 'space', name: `Anirban0011/${process.env.REPO}` },
  token: `${process.env.HF_TOKEN}`,
  spaceSDK: 'docker',
  ifExists: 'skip'
})